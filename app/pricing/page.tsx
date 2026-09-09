'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Check, Crown } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['27 messages/day', 'Standard speed', 'Basic models'],
    accent: '#94A3B8',
  },
  {
    name: 'Basic',
    price: '₹57',
    period: 'month',
    features: ['800 messages/month', 'Faster speed', 'Advanced models', 'Priority support'],
    accent: '#8B5CF6',
    popular: true,
  },
  {
    name: 'All Access',
    price: '₹199',
    period: 'month',
    features: ['Unlimited messages', 'Maximum speed', 'All models', 'Exclusive features'],
    accent: '#3B82F6',
  },
];

export default function PricingPage() {
  const t = useTranslations('nav');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 pt-2"
    >
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient glow-violet">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Pricing</h1>
        <p className="text-sm text-[#94A3B8]">Choose your plan</p>
      </div>

      <div className="flex flex-col gap-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            className={`rounded-2xl border p-5 ${plan.popular ? 'border-gradient p-[1.5px]' : ''}`}
            style={!plan.popular ? { borderColor: '#262640', backgroundColor: '#1A1A2E' } : undefined}
          >
            {plan.popular && (
              <div className="rounded-2xl bg-[#12121F] p-5">
                <PlanContent plan={plan} t={t} />
              </div>
            )}
            {!plan.popular && <PlanContent plan={plan} t={t} />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PlanContent({ plan, t }: { plan: typeof plans[0]; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-[#94A3B8]">
            {plan.price}
            <span className="text-xs">/{plan.period}</span>
          </p>
        </div>
        {plan.popular && (
          <span className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">Popular</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4" style={{ color: plan.accent }} />
            <span className="text-sm text-[#94A3B8]">{f}</span>
          </div>
        ))}
      </div>
      <Link
        href="/"
        className="rounded-xl border border-[#262640] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1A1A2E]"
      >
        {t('home')}
      </Link>
    </div>
  );
}
