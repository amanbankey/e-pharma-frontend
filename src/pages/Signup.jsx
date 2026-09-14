import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { authApi } from '../lib/api';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect');

  const sendOtp = async () => {
    if (!form.email) return setError('Enter your email first');
    setError('');
    try {
      await authApi.sendOtp(form.email);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.signup(form);
      const loginUrl = redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login';
      navigate(loginUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-teal-700">
          <UserPlus size={20} />
        </span>
        <h1 className="mt-5 font-display text-3xl text-teal-900">Create your account</h1>
        <p className="mt-2 text-ink-soft">Order genuine medicines and track deliveries in one place.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-soft">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-soft">Phone number</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-soft">Email</label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
              <button type="button" onClick={sendOtp} className="shrink-0 rounded-xl bg-teal-100 px-4 text-sm font-semibold text-teal-900">
                {otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
          </div>
          {otpSent && (
            <div>
              <label className="text-sm font-medium text-ink-soft">Enter OTP</label>
              <input
                required
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-ink-soft">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already registered? <Link to={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'} className="font-semibold text-teal-900 underline decoration-gold-400 underline-offset-4">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
