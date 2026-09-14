import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.user, res.token);
      toast.success("Logged In Successfully")
      navigate(redirectPath);
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
          <LogIn size={20} />
        </span>
        <h1 className="mt-5 font-display text-3xl text-teal-900">Welcome back</h1>
        <p className="mt-2 text-ink-soft">Sign in to track orders and manage your prescriptions.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-soft">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>
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
           <div className='flex justify-end '>
            <span onClick={() => navigate("/forget-password")} className='text-teal-900 text-sm font-semibold cursor-pointer'>
              Forget Password
            </span>
           </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here? <Link to={redirectPath !== '/profile' ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : '/signup'} className="font-semibold text-teal-900 underline decoration-gold-400 underline-offset-4">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
