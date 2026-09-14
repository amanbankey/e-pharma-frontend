import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Banknote, LogIn, AlertCircle, MapPin, Edit3 } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { orderApi, loadRazorpayScript } from '../lib/api';
import DeliveryAddressModal from '../components/DeliveryAddressModal';

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleRazorpayCheckout = async (finalAddress) => {
    const deliveryAddress = finalAddress || address;
    if (!deliveryAddress?.trim()) {
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
        items: items.map((i) => ({
          product: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        amount: total,
        address: deliveryAddress,
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
              items: items.map((i) => ({
                product: i.id,
                name: i.name,
                qty: i.qty,
                price: i.price,
              })),
              amount: total,
              address: deliveryAddress,
            });

            setIsAddressModalOpen(false);
            clearCart();
            navigate('/profile');
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
      setIsAddressModalOpen(false);
      rzp.open();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  const handleCodCheckout = async (finalAddress) => {
    const deliveryAddress = finalAddress || address;
    if (!deliveryAddress?.trim()) {
      setErrorMsg('Please enter a delivery address');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await orderApi.createCodOrder({
        items: items.map((i) => ({
          product: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        amount: total,
        address: deliveryAddress,
      });

      setIsAddressModalOpen(false);
      clearCart();
      navigate('/profile');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to place Cash on Delivery order.');
      setLoading(false);
      throw err;
    }
  };

  const handleConfirmedAddress = async ({ address: confirmedAddr, city: confirmedCity, state: confirmedState }) => {
    const fullAddress = `${confirmedAddr}, ${confirmedCity}, ${confirmedState}`.trim();
    setAddress(confirmedAddr);

    if (paymentMethod === 'cod') {
      await handleCodCheckout(fullAddress);
    } else {
      await handleRazorpayCheckout(fullAddress);
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    // Always prompt the address popup before making the payment
    setIsAddressModalOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-28 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-700">
          <ShoppingBag size={26} />
        </span>
        <h1 className="mt-6 font-display text-3xl text-teal-900">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add a few products to see them here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
      <h1 className="font-display text-4xl text-teal-900">Your cart</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4"
            >
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-display text-lg text-teal-900">{item.name}</p>
                <p className="text-sm text-ink-soft">₹{item.price} · {item.unit}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1.5 text-teal-900">
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1.5 text-teal-900">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-ink-soft transition hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Order Summary & Checkout */}
        <div className="h-fit rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-xl text-teal-900">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm text-ink-soft">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-ink-soft">
            <span>Delivery</span>
            <span className="font-medium text-teal-700">Free</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg text-teal-900">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* Delivery Address Preview Card */}
          <div className="mt-5 rounded-xl border border-line bg-cream/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <MapPin size={14} className="text-teal-700" /> Delivery Address
              </span>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 transition underline underline-offset-2"
                >
                  <Edit3 size={12} />
                  {user?.address ? 'Edit' : 'Add'}
                </button>
              )}
            </div>
            {user?.address ? (
              <div className="mt-2 text-xs text-ink">
                <p className="font-medium text-teal-950 line-clamp-2">{user.address}</p>
                {(user.city || user.state) && (
                  <p className="mt-0.5 text-ink-soft">
                    {[user.city, user.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-ink-soft">
                {isAuthenticated
                  ? 'Address not set yet. You will be prompted in a popup before payment.'
                  : 'Please sign in to provide delivery address.'}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Payment Method</label>
            <div className="mt-2 space-y-2">
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-teal-700 bg-teal-50/50'
                    : 'border-line hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-800">
                    <CreditCard size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-teal-900">Pay Online (Razorpay)</p>
                    <p className="text-xs text-ink-soft">UPI, Credit/Debit Cards, NetBanking</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="accent-teal-700"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                  paymentMethod === 'cod'
                    ? 'border-teal-700 bg-teal-50/50'
                    : 'border-line hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
                    <Banknote size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-teal-900">Pay Cash on Delivery</p>
                    <p className="text-xs text-ink-soft">Pay cash when medicine arrives at your doorstep</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-teal-700"
                />
              </label>
            </div>
          </div>

          {/* Error Message display */}
          {errorMsg && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Authentication Requirement Check */}
          {!isAuthenticated ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                You must be signed in to complete your order.
              </p>
              <button
                onClick={() => navigate('/login?redirect=/cart')}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3 text-sm font-semibold text-cream transition hover:bg-teal-700"
              >
                <LogIn size={16} />
                Sign in to Checkout
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckoutClick}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60 shadow-sm"
            >
              {loading
                ? 'Processing…'
                : paymentMethod === 'cod'
                ? 'Proceed to Confirm COD Order'
                : `Proceed to Pay ₹${total}`}
            </button>
          )}
        </div>
      </div>

      {/* Pre-payment Delivery Details Popup */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleConfirmedAddress}
        totalAmount={total}
        paymentMethod={paymentMethod}
        isProcessing={loading}
      />
    </div>
  );
}
