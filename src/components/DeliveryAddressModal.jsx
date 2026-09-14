import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,Phone ,
  Compass,
  Home,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CreditCard,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { authApi } from '../lib/api';

export default function DeliveryAddressModal({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  paymentMethod,
  isProcessing = false,
}) {
  const { user, updateUser } = useAuth();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const hasExistingAddress = Boolean(user?.address && user?.city && user?.state);

   const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/; // Example: 10-digit number
    return phoneRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim();
    
    if (!cleanAddress) {
      setErrorMsg('Please enter your complete street/delivery address');
      return;
    }
    if (!cleanCity) {
      setErrorMsg('Please enter your city');
      return;
    }
    if (!cleanState) {
      setErrorMsg('Please enter your state');
      return;
    }

    if(!phone) {
      setErrorMsg('Please enter your number')
      return
    }

    setIsSaving(true);
    try {
      // Save/update address details to database
      const res = await authApi.updateProfile({
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        phone: phone
      });

      const updatedUser = res.data || res.updatedUserDetails || {
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        phone: phone
      };

      updateUser(updatedUser);

      // Trigger the payment callback with the validated address details
      await onConfirm({
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        phone: phone
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update delivery address');
      setIsSaving(false);
    }
  };

  const loading = isSaving || isProcessing;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onClose}
          className="fixed inset-0 bg-teal-950/40 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-paper p-6 shadow-2xl md:p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-100 text-teal-800">
                  <MapPin size={18} />
                </span>
                <h2 className="font-display text-xl text-teal-900">Delivery Details</h2>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                {hasExistingAddress
                  ? 'We found your saved address. Review or edit it before proceeding.'
                  : 'Please provide your delivery address, city, and state to continue.'}
              </p>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="rounded-full p-2 text-ink-soft hover:bg-cream hover:text-teal-900 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Payment & Amount Summary pill */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-teal-200/80 bg-teal-50/50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-teal-950 font-medium">
              {paymentMethod === 'cod' ? (
                <>
                  <Banknote size={17} className="text-amber-700" />
                  <span>Cash on Delivery</span>
                </>
              ) : (
                <>
                  <CreditCard size={17} className="text-teal-700" />
                  <span>Online Payment (Razorpay)</span>
                </>
              )}
            </div>
            <div className="font-display text-base font-bold text-teal-900">
              Total: ₹{totalAmount}
            </div>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Street Address */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Address (House/Flat No., Street, Area, Landmark) <span className="text-red-500">*</span>
                </label>
                {hasExistingAddress && (
                  <span className="text-[11px] font-medium text-teal-700 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Saved in profile
                  </span>
                )}
              </div>
              <div className="relative mt-1.5">
                <Home size={16} className="absolute left-3.5 top-3.5 text-ink-soft" />
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  rows={2}
                  placeholder="e.g. Flat 302, Green Valley Apartments, MG Road"
                  className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500 resize-none"
                  required
                />
              </div>
              <div className=''>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className='relative mt-1.5'>
                     <Phone size={16} className="absolute left-3.5 top-5 -translate-y-1/2 text-ink-soft" />
                      <input
                 id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPhone(value);
                   if (errorMsg) setErrorMsg("");
                   if (value && !validatePhone(value)) {
                      setErrorMsg("Please enter a valid 10-digit phone number.");
                    }
                  }}
                  rows={2}
                  placeholder="Enter your number"
                  className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500 resize-none"
                  required
                />
                  </div> 
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Maharashtra"
                    className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-ink-soft pt-1">
              <ShieldCheck size={14} className="text-teal-700 shrink-0" />
              <span>Your address will be securely saved to your account for future orders.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-cream hover:text-teal-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-teal-900 px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60 shadow-sm"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading
                  ? 'Processing…'
                  : paymentMethod === 'cod'
                  ? 'Confirm & Place COD Order'
                  : `Confirm & Pay ₹${totalAmount}`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
