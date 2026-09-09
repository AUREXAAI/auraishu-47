'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import Logo from '@/components/logo';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
] as const;

export default function WelcomePage() {
  const router = useRouter();
  const t = useTranslations('welcome');

  const chooseLanguage = (code: string) => {
    document.cookie = `aurexa_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    localStorage.setItem('aurexa_lang_chosen', '1');
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-[#05050D]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <Logo />

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient glow-violet">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white text-center">
              {t('title')}
            </h1>
            <p className="text-sm text-[#94A3B8] text-center">{t('subtitle')}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            {languages.map((lang, i) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                onClick={() => chooseLanguage(lang.code)}
                className="rounded-2xl border-gradient p-[1.5px]"
              >
                <div className="rounded-2xl bg-[#12121F] px-6 py-4 text-center">
                  <span className="font-heading text-lg font-semibold text-white">
                    {lang.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
