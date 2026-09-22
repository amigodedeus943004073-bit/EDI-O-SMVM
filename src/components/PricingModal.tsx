import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Crown,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAAS_PLANS } from '../data/plans';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onAddCredits: (amount: number, planName: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  onAddCredits,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [selectedSuccess, setSelectedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: string, credits: number, planName: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAddCredits(credits, planName);
    setSelectedSuccess(planName);
    setTimeout(() => {
      setSelectedSuccess(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-800 flex items-start justify-between bg-neutral-950/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Planos & Créditos
              </span>
              <span className="text-xs text-neutral-400">
                Saldo Atual: <strong className="text-amber-400">{currentCredits} créditos</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Potencialize suas edições com a Inteligência Artificial
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Escolha o plano ideal para criadores de conteúdo, fotógrafos profissionais e estúdios digitais.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Toggle (Monthly / Annual) */}
        <div className="flex justify-center py-4 bg-neutral-900/60 border-b border-neutral-800/80">
          <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                -20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAAS_PLANS.map((plan) => {
            const price = billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-900 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Mais Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    {plan.id === 'pro' ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : plan.id === 'enterprise' ? (
                      <Building className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Zap className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-xs text-neutral-400">R$</span>
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {price}
                    </span>
                    <span className="text-xs text-neutral-400">/mês</span>
                  </div>

                  {/* Credits badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{plan.credits} créditos / mês</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 text-xs text-neutral-300 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id, plan.credits, plan.name)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                      : plan.id === 'enterprise'
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garantia de 7 dias ou seu dinheiro de volta sem burocracia.</span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Pagamentos seguros com criptografia SSL 256-bit
          </span>
        </div>

        {/* Success Toast */}
        {selectedSuccess && (
          <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 gap-3 z-50">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Plano Ativado com Sucesso!</h3>
            <p className="text-xs text-neutral-300 text-center max-w-sm">
              Você agora tem acesso aos recursos do <strong>{selectedSuccess}</strong> e seus créditos foram creditados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
