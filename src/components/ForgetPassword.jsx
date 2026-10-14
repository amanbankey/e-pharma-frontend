import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, CheckCircle2, Mail, Info } from "lucide-react";
import { authApi } from "../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("That doesn't look like a valid email address. Example: name@example.com");
      return;
    }
    try {
      setLoading(true);
      const response = await authApi.resetPasswordToken({
        email: email.trim(),
      });

      if (response?.success) {
        setEmailSent(true);
        toast.success(response.message || "Email sent successfully");
      } else {
        throw new Error(response?.message || "Failed to send reset email");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full ">
      <div className="max-w-md sm:max-w-lg mx-auto px-6 pt-4 pb-8 min-h-screen flex flex-col  rounded-xl">
        <div className="flex-1 flex flex-col items-left justify-center pb-10">

          <h1 className="text-3xl font-extrabold text-teal-900 mb-2.5 text-left">
            {!emailSent ? "Reset Password" : "Check Your Email"}
          </h1>

          <p className="text-teal-900 text-sm leading-[22px] mb-7 ">
            {!emailSent
              ? "Enter your email address and we'll send you a password reset link."
              : `We've sent a password reset link to ${email}`}
          </p>

          <div className="bg-white rounded-[20px] p-5 w-full mb-5 shadow-[0_4px_16px_rgba(26,86,255,0.06)]">
            {!emailSent && (
              <>
                <label className="text-[11px] font-bold text-[#6B7280] tracking-[1px] mb-2 block">
                  EMAIL ADDRESS
                </label>
                <div className="flex items-center gap-2 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-xl px-3 mb-1">
                  <Mail size={18} color="#9CA3AF" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    className="flex-1 py-3.5 text-[#0F1B3D] text-[15px] bg-transparent outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>
              </>
            )}

            {emailSent && (
              <div className="flex items-start gap-2 bg-[#EEF2FF] border border-[#BFDBFE] rounded-xl p-3 mb-1">
                <Info size={16} color="#1A56FF" className="mt-0.5 shrink-0" />
                <span className="flex-1 text-[13px] text-[#374151] leading-[18px]">
                  Check your spam folder if you don't see it in inbox
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-teal-900 py-4 rounded-2xl flex items-center justify-center mt-4 shadow-[0_4px_12px_rgba(26,86,255,0.3)] active:opacity-85 disabled:opacity-70"
            >
              <span className="text-white text-[17px] font-bold tracking-wide">
                {loading
                  ? "Please wait..."
                  : emailSent
                  ? "Resend Email"
                  : "Send Reset Link"}
              </span>
            </button>
          </div>

          <button onClick={() => navigate("/login")}>
            <span className="text-teal-900 text-sm font-semibold">
              ← Back To Login
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}