import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Compass,
  Home,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { authApi } from '../lib/api';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || user.additionalDetails?.contactNumber || '');
      setCity(user.city || '');
      setState(user.state || '');
      setAddress(user.address || '');
    }
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
      };

      if (newPassword) {
        payload.newPassword = newPassword;
      }

      const res = await authApi.updateProfile(payload);
      const updatedData = res.data || res.updatedUserDetails || payload;

      updateUser(updatedData);
      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-paper p-6 shadow-2xl md:p-8"
        >
          {/* Header */}
          <div className="flex  items-center justify-between border-2 border-black  ">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl text-teal-900">Your Profile</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-ink-soft hover:bg-cream hover:text-teal-900 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
              <CheckCircle2 size={17} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                  required
                />
              </div>
            </div>

            {/* Email (Non-editable) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Email Address
                </label>
                <span className="text-[11px] font-medium text-ink-soft flex items-center gap-1">
                  <Lock size={12} /> Non-editable
                </span>
              </div>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="w-full rounded-xl border border-line bg-teal-50/40 pl-10 pr-4 py-2.5 text-sm text-ink-soft cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Phone Number
              </label>
              <div className="relative mt-1.5">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                />
              </div>
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  City
                </label>
                <div className="relative mt-1.5">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  State
                </label>
                <div className="relative mt-1.5">
                  <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Delivery Address
              </label>
              <div className="relative mt-1.5">
                <Home size={16} className="absolute left-3.5 top-3.5 text-ink-soft" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="House/Flat No., Street, Area, Landmark"
                  className="w-full rounded-xl border border-line bg-cream pl-10 pr-4 py-2.5 text-sm text-teal-900 outline-none transition focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="rounded-2xl border border-line bg-cream/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Lock size={14} /> Change Password
              </p>
              <p className="text-[11px] text-ink-soft mt-0.5">
                Leave blank if you don't wish to change your password
              </p>

              <div className="mt-3 space-y-2.5">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full rounded-xl border border-line bg-paper px-4 py-2 text-sm text-teal-900 outline-none transition focus:border-teal-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-line bg-paper px-4 py-2 text-sm text-teal-900 outline-none transition focus:border-teal-500"
                    />
                  </div>
                )}
              </div>
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
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
