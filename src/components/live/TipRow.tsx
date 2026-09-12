import { Coins } from "lucide-react";

const TIP_AMOUNTS = [50, 120, 500];

interface TipRowProps {
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
  onConfirm: (amount: number) => void;
}

export function TipRow({ selectedAmount, onSelect, onConfirm }: TipRowProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
      {TIP_AMOUNTS.map((amount) => {
        const isSelected = selectedAmount === amount;

        return (
          <button
            key={amount}
            type="button"
            onClick={() => {
              if (isSelected) {
                onConfirm(amount);
              } else {
                onSelect(amount);
              }
            }}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shadow-xs backdrop-blur-[10px] transition-all duration-200 active:scale-95 cursor-pointer ${
              isSelected
                ? "border border-gold bg-gold text-white shadow-[0_6px_20px_-6px_rgba(184,121,28,0.7)]"
                : "border border-white/50 bg-white/90 text-ink hover:bg-white"
            }`}
          >
            <Coins
              className={`h-3.5 w-3.5 stroke-[2.2] ${isSelected ? "text-white" : "text-gold-deep"}`}
            />
            <span>{isSelected ? `Send ${amount}` : String(amount)}</span>
          </button>
        );
      })}
    </div>
  );
}
