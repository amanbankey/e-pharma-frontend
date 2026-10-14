import { useState } from 'react';
import { useAuth } from './AuthContext';
import { orderApi, loadRazorpayScript } from './api';

const toOrderItems = (items) =>
  items.map((i) => ({
    product: i.id,
    name: i.name,
    qty: i.qty,
    price: i.price,
  }));

/**
 * Shared checkout logic (Razorpay + Cash on Delivery) used by both the Cart and Buy Now.
 * `onSuccess` runs after the order is placed / payment is verified.
 */
export function useCheckout({ onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const payOnline = async ({ items, total, address, onBeforeOpen }) => {
    if (!address?.trim()) {
      setErrorMsg('Please enter a delivery address');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const orderData = await orderApi.createOrder({
        items: toOrderItems(items),
        amount: total,
        address,
      });

      const { order } = orderData;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.id,
        name: 'Vernal Rx',
        description: 'Pharmacy Order Payment',
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        handler: async (response) => {
          try {
            await orderApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: toOrderItems(items),
              amount: total,
              address,
            });

            onSuccess();
          } catch (verifyErr) {
            setErrorMsg(verifyErr?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: {
          color: '#124C42',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        setErrorMsg(
          response?.error?.description || 'Payment failed. Please try again or use Cash on Delivery.'
        );
        setLoading(false);
      });

      // Close our address popup when razorpay opens so they don't conflict
      onBeforeOpen?.();
      rzp.open();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  const placeCodOrder = async ({ items, total, address }) => {
    if (!address?.trim()) {
      setErrorMsg('Please enter a delivery address');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await orderApi.createCodOrder({
        items: toOrderItems(items),
        amount: total,
        address,
      });

      onSuccess();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to place Cash on Delivery order.');
      setLoading(false);
      throw err;
    }
  };

  const checkout = ({ paymentMethod, ...rest }) =>
    paymentMethod === 'cod' ? placeCodOrder(rest) : payOnline(rest);

  return { loading, errorMsg, setErrorMsg, checkout };
}
