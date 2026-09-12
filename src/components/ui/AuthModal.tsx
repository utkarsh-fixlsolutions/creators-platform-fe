import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: 'fan' | 'creator';
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'fan',
  initialMode = 'signup',
  onClose,
}) => {
  const [role, setRole] = useState<'fan' | 'creator'>(initialRole);
  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const [inputVal, setInputVal] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  if (!isOpen) return null;

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
      setTimeout(() => {
        setStep('success');
      }, 400);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#111111]/45 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8E5E0] shadow-2xl z-10 text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#F5F2EB] text-[#111111] hover:bg-[#EAE5DC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="font-serif text-2xl font-light tracking-[0.25em] text-[#111111] block mb-2">
              LUXE
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#111111] font-normal tracking-tight">
              {step === 'success'
                ? 'Welcome to LUXE'
                : initialMode === 'login'
                ? 'Sign In to Your Account'
                : 'Experience More Than Content'}
            </h3>
            <p className="text-xs text-[#7A7772] mt-1 font-normal">
              {step === 'otp'
                ? `Enter the 6-digit code sent to ${inputVal}`
                : step === 'success'
                ? 'Your secure session has been verified.'
                : 'Passwordless, instant access with your phone or email.'}
            </p>
          </div>

          {step === 'input' && (
            <div>
              {/* Role Toggle */}
              <div className="flex bg-[#F5F2EB] p-1 rounded-2xl mb-6 border border-[#EBE6DC]">
                <button
                  type="button"
                  onClick={() => setRole('fan')}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                    role === 'fan'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E6E] hover:text-[#111111]'
                  }`}
                >
                  Join as Fan
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                    role === 'creator'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E6E] hover:text-[#111111]'
                  }`}
                >
                  Become a Creator
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendCode}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#111111] mb-2">
                    {channel === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
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
                      className="w-full pl-10 pr-4 py-3 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-2xl text-[#111111] focus:outline-none focus:bg-white focus:border-[#111111]"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setChannel(channel === 'phone' ? 'email' : 'phone');
                      setInputVal('');
                    }}
                    className="text-[11px] text-[#7A7772] hover:text-[#111111] underline font-medium"
                  >
                    {channel === 'phone' ? 'Continue with email instead' : 'Continue with phone instead'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Age and Trust Note */}
              <div className="mt-6 pt-4 border-t border-[#F0ECE4] flex items-center gap-2 text-[11px] text-[#8C8C8C]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Must be 18+. Bank-grade encryption & confidentiality.</span>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <div className="flex justify-between gap-2 mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    className="w-11 h-13 text-center font-mono text-lg font-semibold bg-[#F8F6F2] border border-[#E0DCD3] rounded-xl text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-[#7A7772] hover:text-[#111111] underline"
                >
                  Change {channel}
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8C8C8C]">
                Didn't receive code? Resend in 30s
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-xl text-[#111111] font-normal mb-2">
                Authentication Successful
              </h4>
              <p className="text-xs text-[#6E6E6E] mb-6">
                Entering {role === 'creator' ? 'Creator Studio' : 'LUXE Discovery Feed'}...
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#111111] text-white text-xs font-medium rounded-2xl"
              >
                Enter Ecosystem
              </button>
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
