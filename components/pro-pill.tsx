'use client';

import { Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function ProPill() {
  const t = useTranslations('header');
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      className="relative flex items-center gap-1.5 rounded-full p-[1.5px]"
      style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
    >
      <span className="flex items-center gap-1 rounded-full bg-[#05050D] px-3 py-1.5">
        <Crown className="h-3.5 w-3.5 text-[#8B5CF6]" />
        <span className="font-heading text-xs font-semibold text-white">{t('pro')}</span>
      </span>
    </motion.button>
  );
}
