import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Phone, Lock, User, KeyRound, ArrowRight, Edit3, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { PASSWORD_MIN_LENGTH, getPasswordConditionErrors, isPasswordTooShort } from '../lib/passwordValidation';

const Signup = () => {
  // Step 1: phone, fullName, password -> Send OTP. Step 2: OTP only -> Signup
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [val, setVal] = useState({
    fullName: '',
    phone: '',
    password: '',
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const loginUrl = redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login';

  // Cooldown countdown for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Validate details, then Send Mobile OTP via MSG91
  const sendOtp = async (e) => {
    e.preventDefault();

    if (!val.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      toast.error('Please enter your mobile number to receive the OTP.');
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      toast.error('Mobile number must be exactly 10 digits (without +91).');
      return;
    }

    if (!val.password) {
      toast.error('Please create a password for your account.');
      return;
    }
    if (isPasswordTooShort(val.password)) {
      toast.error(`Password is too short. Please use at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    const conditionErrors = getPasswordConditionErrors(val.password);
    if (conditionErrors.length > 0) {
      setPasswordErrors(conditionErrors);
      return;
    }
    setPasswordErrors([]);

    setLoading(true);
    try {
      const res = await authApi.sendMobileOtp(cleanPhone);
      if (res.success || res.message?.toLowerCase().includes('otp sent')) {
        // Sync phone into signup form values
        setVal((prev) => ({ ...prev, phone: cleanPhone }));
        setOtpDigits(['', '', '', '', '', '']);
        setStep(2);
        setResendCooldown(30); // 30-second cooldown before resending
        toast.success('OTP sent to your mobile number. It is valid for 5 minutes.');
      } else {
        toast.error(res.message || 'Could not send the OTP. Please try again.');
      }
    } catch (err) {
      const message = err.message || 'Something went wrong while sending OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    const targetPhone = val.phone || phone.trim();
    setLoading(true);
    try {
      const res = await authApi.sendMobileOtp(targetPhone);
      if (res.success || res.message?.toLowerCase().includes('otp sent')) {
        setResendCooldown(30);
        toast.success('A new OTP has been sent to your mobile number.');
      } else {
        toast.error(res.message || 'Could not resend the OTP. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle typing into one of the 6 OTP boxes
  const handleOtpChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    otpRefs.current[lastIndex]?.focus();
  };

  // Step 2: Verify OTP with MSG91 & Create User in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanOtp = otpDigits.join('');
    if (cleanOtp.length !== 6) {
      toast.error('The OTP must be 6 digits. Please enter the complete OTP you received by SMS.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.mobileSignup({
        fullName: val.fullName.trim(),
        phone: val.phone || phone.trim(),
        password: val.password,
        otp: cleanOtp,
      });

      if (res.success || res.message === 'Signup successfully') {
        toast.success('Account created successfully! Please sign in.');
        setTimeout(() => {
          navigate(loginUrl);
        }, 1000);
      } else {
        toast.error(res.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      // If OTP is wrong/expired, backend returns error and user cannot proceed
      const message = err.message || 'Something went wrong during signup';
      toast.error(`${message} ❌`);
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
        {/* Header Icon */}
        <div className='flex  items-center justify-around gap-10'>

          <div> <h1 className="mt-5 font-display text-3xl text-teal-900">Create your account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Order genuine medicines and track deliveries easily with your mobile number.
        </p> </div>

        </div>

        {/* <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
         {step === 1 && (<div className='flex items-center justify-around gap-3'><span
            className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
              step === 1 ? 'bg-teal-900 text-cream' : 'bg-teal-100 text-teal-900'
            }`}
          >
            1
          </span>   <span className={step === 1 ? 'text-teal-900' : 'text-ink-soft'}>Account Details</span></div>  )}


         {step === 2 && ( <div className='flex items-center justify-around gap-3'>  <span
            className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
              step === 2 ? 'bg-teal-900 text-cream' : 'bg-teal-100 text-teal-900'
            }`}
          >
            2
          </span>
          <span className={step === 2 ? 'text-teal-900' : 'text-ink-soft'}>Verify Mobile</span></div>  )}
        </div> */}

        <AnimatePresence mode="wait">
          {/* STEP 1: Full Name, Phone, Password -> Send OTP */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              onSubmit={sendOtp}
              noValidate
              className="mt-6 space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-ink-soft">Full Name</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-line bg-paper px-3 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                  <User size={16} className="text-ink-soft mr-2" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full bg-transparent py-3 text-sm text-ink outline-none"
                    value={val.fullName}
                    onChange={(e) => setVal({ ...val, fullName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-ink-soft">
                  Mobile Number
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-line bg-paper px-3 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                  <span className="flex items-center gap-1.5 border-r border-line pr-3 text-sm font-semibold text-ink-soft">
                    <Phone size={15} className="text-teal-700" />
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-3 text-sm text-ink outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">
                  We will send an SMS verification OTP to this number.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-ink-soft">Password</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-line bg-paper px-3 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                  <Lock size={16} className="text-ink-soft mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent py-3 text-sm text-ink outline-none"
                    value={val.password}
                    onChange={(e) => {
                      setVal({ ...val, password: e.target.value });
                      setPasswordErrors([]);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-ink-soft hover:text-teal-900"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {passwordErrors.map((err) => (
                      <li key={err} className="text-xs text-red-600">{err}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </motion.form>
          )}

          {/* STEP 2: OTP only -> Signup */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
              {/* Mobile Number (Display only) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-soft">Mobile Number</label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                  >
                    <Edit3 size={12} /> Change number
                  </button>
                </div>
                <div className="mt-1.5 flex items-center rounded-xl border border-line bg-gray-100 px-4 py-3 text-sm text-ink-soft cursor-not-allowed">
                  <Phone size={15} className="mr-2 text-teal-800" />
                  <span className="font-semibold text-teal-950">+91 {val.phone || phone}</span>
                  <span className="ml-auto rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    OTP Sent
                  </span>
                </div>
              </div>

              {/* OTP - 6 boxes */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-soft">Enter SMS OTP</label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-xs font-semibold text-teal-700 hover:underline disabled:text-ink-soft disabled:no-underline cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-11 rounded-xl border border-line bg-paper text-center text-lg font-semibold text-ink outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full cursor-pointer rounded-full bg-teal-900 py-3.5 font-semibold text-cream transition hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? 'Verifying & Creating Account…' : 'Signup'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer Link to Login */}
        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link
            to={loginUrl}
            className="font-semibold text-teal-900 underline decoration-gold-400 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
