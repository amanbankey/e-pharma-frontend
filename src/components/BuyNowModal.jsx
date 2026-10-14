import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Zap, AlertCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/AuthContext';
import { useCheckout } from '../lib/useCheckout';
import PaymentMethodSelector from './PaymentMethodSelector';
import DeliveryAddressModal from './DeliveryAddressModal';

export default function BuyNowModal({ product, isOpen, onClose, initialQty = 1 }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const { loading, errorMsg, setErrorMsg, checkout } = useCheckout({
    onSuccess: () => {
      setIsAddressModalOpen(false);
      onClose();
      toast.success('Order placed successfully!');
      navigate('/profile');
    },
  });

  useEffect(() => {
    if (isOpen) {
      setQty(initialQty);
      setPaymentMethod('razorpay');
      setIsAddressModalOpen(false);
      setErrorMsg('');
    }
  }, [isOpen, initialQty, setErrorMsg]);

  if (!isOpen || !product) return null;

  const maxQty = product.availableStock > 0 ? product.availableStock : 1;
  const total = product.price * qty;

  const handleIncrement = () => {
    if (qty >= maxQty) {
      toast.error(`Only ${maxQty} ${maxQty > 1 ? 'units are' : 'unit is'} available in stock.`);
      return;
    }
    setQty((q) => q + 1);
  };

  const handleConfirmedAddress = async ({ address, city, state }) => {
    const fullAddress = `${address}, ${city}, ${state}`.trim();
    await checkout({
      paymentMethod,
      items: [{ ...product, qty }],
      total,
      address: fullAddress,
      onBeforeOpen: () => setIsAddressModalOpen(false),
    });
  };

  const handleContinue = () => {
    setErrorMsg('');
    setIsAddressModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-paper p-5 shadow-2xl sm:p-7"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold-100 text-gold-600">
                  <Zap size={18} />
                </span>
                <h2 className="font-display text-xl text-teal-900">Buy now</h2>
              </div>
              {!loading && (
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-ink-soft transition hover:bg-cream hover:text-teal-900"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Product */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-line bg-cream/60 p-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 rounded-xl bg-white object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-display text-base text-teal-900">{product.name}</p>
                <p className="text-sm text-ink-soft">₹{product.price} · {product.unit}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Quantity</span>
              <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1 || loading}
                  className="p-1.5 text-teal-900 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={loading}
                  className="p-1.5 text-teal-900 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 space-y-1 rounded-2xl border border-line p-4 text-sm text-ink-soft">
              <div className="flex justify-between">
                <span>Subtotal ({qty} × ₹{product.price})</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-medium text-teal-700">Free</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-display text-lg text-teal-900">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="mt-4">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">You must be signed in to place your order.</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3 text-sm font-semibold text-cream transition hover:bg-teal-700"
                >
                  <LogIn size={16} />
                  Sign in to continue
                </button>
              </div>
            ) : (
              <button
                onClick={handleContinue}
                disabled={loading}
                className="mt-5 w-full rounded-full bg-teal-900 py-3.5 font-semibold text-cream shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
              >
                {loading
                  ? 'Processing…'
                  : paymentMethod === 'cod'
                  ? 'Continue — enter delivery details'
                  : `Continue to pay ₹${total}`}
              </button>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Delivery details: address, phone, city and state (same popup as the cart) */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleConfirmedAddress}
        totalAmount={total}
        paymentMethod={paymentMethod}
        isProcessing={loading}
      />
    </>
  );
}
