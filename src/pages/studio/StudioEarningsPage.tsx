import React, { useState } from 'react';
import { DollarSign, Clock, CheckCircle2, ArrowRight, CreditCard, Building } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';

export const StudioEarningsPage: React.FC = () => {
  const { availableCredits, pendingCredits, lifetimeEarned, requestPayout } = useWalletStore();
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'payoneer'>('bank');

  const handleWithdraw = () => {
    if (availableCredits < 5000) {
      alert('Minimum payout withdrawal is $50.00 (5,000 Credits).');
      return;
    }
    const success = requestPayout(availableCredits);
    if (success) {
      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Available for Payout */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-[#7A7772] uppercase font-mono">AVAILABLE FOR PAYOUT</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-4xl text-[#111111] font-normal tracking-tight">
            ${(availableCredits / 100).toFixed(2)}
          </h2>
          <p className="text-xs text-[#6E6E6E] mt-2 mb-6">
            Cleared all holding buffers. Ready for bank transfer.
          </p>
          
          <button
            onClick={handleWithdraw}
            disabled={availableCredits <= 0}
            className="w-full py-3 bg-[#111111] hover:bg-[#2A2A2A] disabled:bg-[#DED9CF] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>Request Instant Payout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: 7-Day Pending Hold */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-[#7A7772] uppercase font-mono">7-DAY PENDING HOLD</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-4xl text-[#111111] font-normal tracking-tight">
            ${(pendingCredits / 100).toFixed(2)}
          </h2>
          <p className="text-xs text-[#6E6E6E] mt-2">
            Standard 7-day rolling reserve to absorb dispute & refund buffer per Master Index §2.5.
          </p>
          <div className="mt-6 pt-4 border-t border-[#F0ECE4] text-[11px] text-[#8C8C8C]">
            Next release batch: Tomorrow at 00:00 UTC
          </div>
        </div>

        {/* Card 3: Lifetime Earnings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-[#7A7772] uppercase font-mono">LIFETIME EARNINGS</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F2EB] text-[#111111] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-4xl text-[#111111] font-normal tracking-tight">
            ${(lifetimeEarned / 100).toFixed(2)}
          </h2>
          <p className="text-xs text-[#6E6E6E] mt-2">
            Cumulative gross earnings generated across all subscription tiers, PPVs, and tips.
          </p>
          <div className="mt-6 pt-4 border-t border-[#F0ECE4] text-[11px] text-[#8C8C8C]">
            Tax Form 1099 Status: Ready
          </div>
        </div>

      </div>

      {payoutSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Payout request submitted successfully! Funds will arrive in your bank in 1-2 business days.</span>
        </div>
      )}

      {/* Payout Rail Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
          PAYOUT RAILS & BANKING
        </span>
        <h3 className="font-serif text-2xl text-[#111111] mt-1 mb-2">Configured Withdrawal Methods</h3>
        <p className="text-xs text-[#6E6E6E] mb-6">
          Direct ACH, Wire, and Payoneer international payment rails (Part F3).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div
            onClick={() => setSelectedMethod('bank')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
              selectedMethod === 'bank'
                ? 'bg-[#F9F7F2] border-[#111111] shadow-xs'
                : 'bg-white border-[#E8E5E0] hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0DCD3] flex items-center justify-center text-[#111111]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-[#111111]">Direct Bank Deposit (ACH / Wire)</h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold">Primary</span>
              </div>
              <p className="text-[11px] text-[#7A7772] mt-0.5 font-mono">JPMorgan Chase Bank •••• 8841</p>
              <p className="text-[10px] text-[#8C8C8C] mt-1">Payout speed: 1-2 business days</p>
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod('payoneer')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
              selectedMethod === 'payoneer'
                ? 'bg-[#F9F7F2] border-[#111111] shadow-xs'
                : 'bg-white border-[#E8E5E0] hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0DCD3] flex items-center justify-center text-[#111111]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#111111]">Payoneer Global Wallet</h4>
              <p className="text-[11px] text-[#7A7772] mt-0.5 font-mono">creator.payout@luxe.is</p>
              <p className="text-[10px] text-[#8C8C8C] mt-1">Payout speed: Instant to 24 hours</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
