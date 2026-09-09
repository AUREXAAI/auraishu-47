'use client';

import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ToolsPage() {
  const t = useTranslations('nav');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center gap-4 pt-24"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 glow-violet">
        <LayoutGrid className="h-8 w-8 text-[#8B5CF6]" />
      </div>
      <h1 className="font-heading text-xl font-bold text-white">{t('tools')}</h1>
      <p className="text-sm text-[#94A3B8]">Coming soon</p>
    </motion.div>
  );
}
