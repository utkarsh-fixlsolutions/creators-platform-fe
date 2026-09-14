import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Phone, Mail, ArrowRight, ShieldCheck, Zap, Sparkles, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore, DEMO_FAN_USER, DEMO_CREATOR_USER } from '../../store/sessionStore';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: 'fan' | 'creator';
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'fan',
  initialMode = 'signup',
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { login } = useSessionStore();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'fan' | 'creator'>(initialRole);
  const [channel, setChannel] = useState<'phone' | 'email'>('email');
  const [inputVal, setInputVal] = useState(DEMO_FAN_USER.email || '');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);

  // Reset and pre-fill every time modal opens or role/channel changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setStep('input');
      setOtp(['1', '2', '3', '4', '5', '6']);

      if (initialRole === 'fan') {
        setInputVal(channel === 'email' ? DEMO_FAN_USER.email! : DEMO_FAN_USER.phone!);
      } else {
        setInputVal(channel === 'email' ? DEMO_CREATOR_USER.email! : DEMO_CREATOR_USER.phone!);
      }
    }
  }, [isOpen, initialRole, initialMode, channel]);

  // Update pre-fill value when role or channel toggles
  const handleRoleChange = (newRole: 'fan' | 'creator') => {
    setRole(newRole);
    if (newRole === 'fan') {
      setInputVal(channel === 'email' ? DEMO_FAN_USER.email! : DEMO_FAN_USER.phone!);
    } else {
      setInputVal(channel === 'email' ? DEMO_CREATOR_USER.email! : DEMO_CREATOR_USER.phone!);
    }
  };

  const handleChannelChange = (newChannel: 'phone' | 'email') => {
    setChannel(newChannel);
    if (role === 'fan') {
      setInputVal(newChannel === 'email' ? DEMO_FAN_USER.email! : DEMO_FAN_USER.phone!);
    } else {
      setInputVal(newChannel === 'email' ? DEMO_CREATOR_USER.email! : DEMO_CREATOR_USER.phone!);
    }
  };

  // Instant 1-Click Demo Login
  const handleInstantDemoLogin = () => {
    const targetUser = role === 'fan' ? DEMO_FAN_USER : DEMO_CREATOR_USER;
    login(targetUser, 'demo_jwt_token');
    setStep('success');
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;
    setStep('otp');
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleCompleteAuth();
    }
  };

  const handleCompleteAuth = () => {
    const targetUser = role === 'fan' ? DEMO_FAN_USER : DEMO_CREATOR_USER;
    login(targetUser, 'demo_jwt_token');
    setStep('success');
  };

  const handleEnterEcosystem = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
    navigate('/app');
  };

  if (!isOpen) return null;

  const currentDemoUser = role === 'fan' ? DEMO_FAN_USER : DEMO_CREATOR_USER;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-2xl z-10 text-left my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#F5F2EB] text-[#111111] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xl tracking-[0.2em] text-[#111111] block">
                LUXE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200/70">
                <Sparkles className="w-2.5 h-2.5" /> Demo Mode
              </span>
            </div>
            
            <h3 className="font-bold text-xl sm:text-2xl text-[#111111] tracking-tight">
              {step === 'success'
                ? 'Welcome to LUXE'
                : mode === 'login'
                ? 'Sign In to Your Account'
                : 'Experience More Than Content'}
            </h3>
            
            <p className="text-xs text-[#7A7772] mt-1 font-normal">
              {step === 'otp'
                ? `Enter 6-digit code sent to ${inputVal}`
                : step === 'success'
                ? 'Your secure session has been verified.'
                : 'Passwordless instant access with pre-filled demo accounts.'}
            </p>
          </div>

          {step === 'input' && (
            <div>
              {/* Role Toggle */}
              <div className="flex bg-[#F5F2EB] p-1 rounded-2xl mb-4 border border-[#EBE6DC]">
                <button
                  type="button"
                  onClick={() => handleRoleChange('fan')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'fan'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E6E] hover:text-[#111111]'
                  }`}
                >
                  <span>Fan Account</span>
                  {role === 'fan' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('creator')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'creator'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E6E] hover:text-[#111111]'
                  }`}
                >
                  <span>Creator Account</span>
                  {role === 'creator' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              </div>

              {/* 1-Click Instant Demo Login Banner */}
              <div className="mb-5 p-3.5 bg-gradient-to-r from-[#FAF8F5] to-[#F3EFE6] border border-[#E4DFD5] rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentDemoUser.avatarUrl}
                    alt={currentDemoUser.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#D5CFBF] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#111111] truncate">
                        {currentDemoUser.displayName}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-[11px] text-[#7A7772] truncate block">
                      @{currentDemoUser.handle} · {role === 'fan' ? '450 Coins' : 'Creator Tier'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="px-3.5 py-2 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>1-Click Login</span>
                </button>
              </div>

              {/* Input Form with Pre-filled Credentials */}
              <form onSubmit={handleSendCode}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#111111]">
                      {channel === 'phone' ? 'Phone Number' : 'Email Address'}
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Pre-filled Demo
                    </span>
                  </div>

                  <div className="relative">
                    {channel === 'phone' ? (
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                    ) : (
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                    )}
                    <input
                      type={channel === 'phone' ? 'tel' : 'email'}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={channel === 'phone' ? '+1 (555) 000-0000' : 'name@example.com'}
                      className="w-full pl-10 pr-4 py-3 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-2xl text-[#111111] focus:outline-none focus:bg-white focus:border-[#111111] transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => handleChannelChange(channel === 'phone' ? 'email' : 'phone')}
                    className="text-[11px] text-[#7A7772] hover:text-[#111111] underline font-medium cursor-pointer"
                  >
                    {channel === 'phone' ? 'Switch to demo email' : 'Switch to demo phone'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-[11px] text-[#7A7772] hover:text-[#111111] font-medium cursor-pointer"
                  >
                    {mode === 'login' ? 'New to LUXE? Sign Up' : 'Already have account? Sign In'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <span>Continue to OTP Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Age and Trust Note */}
              <div className="mt-5 pt-3.5 border-t border-[#F0ECE4] flex items-center gap-2 text-[11px] text-[#8C8C8C]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Demo environment ready · Pre-loaded with creator content & 450 coins.</span>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Demo Code <span className="font-mono font-bold">123456</span> pre-filled for instant access
                </span>
              </div>

              <div className="flex justify-between gap-2 mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    className="w-11 h-13 text-center font-mono text-lg font-bold bg-[#F8F6F2] border border-[#E0DCD3] rounded-xl text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleCompleteAuth}
                className="w-full py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 mb-4 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Enter Ecosystem (Demo)</span>
              </button>

              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-[#7A7772] hover:text-[#111111] underline cursor-pointer"
                >
                  Change {channel === 'phone' ? 'phone number' : 'email'}
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8C8C8C]">
                Demo Verification · Instant access granted
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-xl text-[#111111] tracking-tight mb-1">
                Authentication Successful
              </h4>
              <p className="text-xs text-[#6E6E6E] mb-2">
                Welcome, <span className="font-semibold text-[#111111]">{currentDemoUser.displayName}</span> (@{currentDemoUser.handle})
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F2EB] rounded-full text-[11px] text-[#111111] font-medium mb-6">
                <span>Role: {role === 'fan' ? '💎 Fan Explorer (450 Coins)' : '✨ Creator Studio'}</span>
              </div>

              <button
                onClick={handleEnterEcosystem}
                className="w-full py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Enter LUXE Discovery Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
};

