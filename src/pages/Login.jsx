import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = form.phone.trim();
    if (!cleanPhone) {
      toast.error('Please enter your mobile number to sign in.');
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      toast.error('Mobile number must be exactly 10 digits (without +91).');
      return;
    }

    if (!form.password) {
      toast.error('Please enter your password to sign in.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.mobileLogin({
        phone: cleanPhone,
        password: form.password,
      });

      login(res.user, res.token);
      toast.success('Logged in successfully!');
      navigate(redirectPath);
    } catch (err) {
      const message = err.message || 'Login failed, please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
     

        {/* Title */}
        <h1 className="mt-5 font-display text-3xl text-teal-900">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in with your mobile number to track orders and manage prescriptions.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
          {/* Mobile Number Input */}
          <div>
            <label htmlFor="login-phone" className="text-sm font-medium text-ink-soft">
              Mobile Number
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-line bg-paper px-3 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <span className="flex items-center gap-1.5 border-r border-line pr-3 text-sm font-semibold text-ink-soft">
                <Phone size={15} className="text-teal-700" />
                +91
              </span>
              <input
                id="login-phone"
                type="tel"
                maxLength={10}
                required
                placeholder="Enter 10-digit number"
                className="w-full bg- px-3 py-3 text-sm text-ink outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink-soft">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forget-password')}
                className="text-xs font-semibold text-teal-900 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="mt-1.5 flex items-center rounded-xl border border-line bg-paper px-3 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Lock size={16} className="mr-2 text-ink-soft" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent py-3 text-sm text-ink outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ink-soft hover:text-teal-900"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer Link to Signup */}
        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{' '}
          <Link
            to={
              redirectPath !== '/profile'
                ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
                : '/signup'
            }
            className="font-semibold text-teal-900 underline decoration-gold-400 underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
