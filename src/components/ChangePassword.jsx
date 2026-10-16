import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Info, Loader2, X, Lock } from "lucide-react";
import { authApi } from "../lib/api";
import { PASSWORD_MIN_LENGTH, getPasswordConditionErrors, isPasswordTooShort } from "../lib/passwordValidation";

export default function ChangePassword({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      toast.error("Please enter your current (old) password.");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter the new password you want to set.");
      return;
    }

    if (isPasswordTooShort(newPassword)) {
      toast.error(`New password is too short. Please use at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    const conditionErrors = getPasswordConditionErrors(newPassword);
    if (conditionErrors.length > 0) {
      setPasswordErrors(conditionErrors);
      return;
    }
    setPasswordErrors([]);

    if (newPassword === oldPassword) {
      toast.error("New password must be different from your old password.");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.changePassword({
        oldPassword,
        newPassword,
      });

      toast.success(res?.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (error) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-[24px] p-6 w-full shadow-2xl border border-line">
         <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
            <h1 className="text-teal-900 text-2xl sm:text-3xl font-extrabold mb-2 text-left leading-tight">
            Change Password
            </h1>

            <p className="text-[#6B7280] text-sm leading-[22px] text-left max-w-[90%] sm:max-w-full">
            Update your password to keep your account secure and protected.
            </p>
        </div>

  <button
    onClick={onClose}
    type="button"
    className="shrink-0 rounded-full cursor-pointer p-2 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-teal-900 transition-colors duration-200"
    aria-label="Close"
  >
    <X size={20} />
  </button>
</div>
        


            <label className="text-[#6B7280] text-[11px] font-bold tracking-[1px] mb-2 mt-1 block">
              OLD PASSWORD
            </label>
            <div className="flex items-center bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-xl mb-4 px-3.5">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="flex-1 text-[#0F1B3D] text-[15px] py-3.5 bg-transparent outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="pl-2.5 py-2"
              >
                {showOldPassword ? (
                  <EyeOff size={16} color="#6B7280" />
                ) : (
                  <Eye size={16} color="#6B7280" />
                )}
              </button>
            </div>

            <label className="text-[#6B7280] text-[11px] font-bold tracking-[1px] mb-2 mt-1 block">
              NEW PASSWORD
            </label>
            <div className="flex items-center bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-xl mb-4 px-3.5">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors([]);
                }}
                className="flex-1 text-[#0F1B3D] text-[15px] py-3.5 bg-transparent outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="pl-2.5 py-2"
              >
                {showNewPassword ? (
                  <EyeOff size={16} color="#6B7280" />
                ) : (
                  <Eye size={16} color="#6B7280" />
                )}
              </button>
            </div>

            {passwordErrors.length > 0 && (
              <ul className="mb-3 space-y-0.5">
                {passwordErrors.map((err) => (
                  <li key={err} className="text-xs text-red-600">{err}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-1.5 bg-[#EEF2FF] rounded-[10px] p-2.5 mb-1">
              <Info size={14}  className="shrink-0 text-teal-900" />
              <span className="flex-1 text-xs text-[#374151] leading-4">
                Use at least 8 characters with a letter, a number and a special character
              </span>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className={`w-full bg-teal-900 py-4 rounded-2xl flex items-center justify-center mt-4 shadow-[0_4px_12px_rgba(26,86,255,0.3)] active:opacity-85 ${
                loading ? "opacity-70" : ""
              }`}
            >
              {loading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <span className="text-white text-[17px] font-bold tracking-wide">
                  Update Password
                </span>
              )}
            </button>
          </div>
      </div>
    </div>
  );
}