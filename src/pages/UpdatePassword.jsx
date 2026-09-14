import { useState } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';

export default function UpdatePassword() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || params.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing from the link. Please request a new link.');
      toast.error('Reset token missing');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      toast.error('Please enter all required details');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password too short');
      return;
    }

    if (password !== confirmPassword) {
      setError('New password and confirm password do not match.');
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({
        token,
        password,
        confirmPassword,
      });

      if (res?.success === false) {
        throw new Error(res?.message || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast.success(res?.message || 'Password reset successfully!');
    } catch (err) {
      const errMsg = err?.message || 'Failed to reset password. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Icon */}
        <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-teal-800">
          <KeyRound size={22} />
        </span>

        {isSuccess ? (
          /* Success Screen */
          <div className="mt-6">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={24} />
              <h1 className="font-display text-3xl text-teal-900">Password reset!</h1>
            </div>
            <p className="mt-3 text-ink-soft">
              Your password has been successfully updated in our system. You can now sign in with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 shadow-md"
            >
              Sign in with new password
            </button>
          </div>
        ) : (
          /* Reset Form Screen */
          <>
            <h1 className="mt-5 font-display text-3xl text-teal-900">Reset your password</h1>
            <p className="mt-2 text-ink-soft">
              Enter and confirm your new password below to securely update your account.
            </p>

            {/* Warning if token is missing */}
            {!token && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="text-sm">
                  <p className="font-semibold">Missing reset token</p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    The link you used might be incomplete. Please check the full URL in your email or generate a new reset link.
                  </p>
                  <Link
                    to="/forget-password"
                    className="mt-2 inline-block font-semibold text-amber-900 underline hover:text-amber-950"
                  >
                    Request new reset link →
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* New Password */}
              <div>
                <label className="text-sm font-medium text-ink-soft">New Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium text-ink-soft">Confirm Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm outline-none transition pr-11 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-line focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-900 transition"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Password Requirement Hint */}
              <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-100 px-3.5 py-2.5 text-xs text-teal-800">
                <ShieldCheck size={16} className="shrink-0 text-teal-700" />
                <span>Password must be at least 6 characters long</span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Resetting Password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>

            {/* Back to Login link */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-900 hover:underline"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}