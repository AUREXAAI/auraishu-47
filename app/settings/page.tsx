'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, LogOut, Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
] as const;

export default function SettingsPage() {
  const t = useTranslations('nav');
  const ts = useTranslations('settings');
  const router = useRouter();
  const { signOut } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [showLangOptions, setShowLangOptions] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(?:^|; )aurexa_lang=([^;]*)'));
    if (match) setCurrentLang(decodeURIComponent(match[1]));
  }, []);

  const chooseLanguage = (code: string) => {
    document.cookie = `aurexa_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setCurrentLang(code);
    setShowLangOptions(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 pt-2"
    >
      <h1 className="font-heading text-2xl font-bold text-white">{t('settings')}</h1>

      {/* Language Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#8B5CF6]" />
          <span className="font-heading text-sm font-semibold text-white">{ts('language')}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLangOptions(!showLangOptions)}
          className="flex items-center gap-3 rounded-2xl border border-[#262640] bg-[#1A1A2E] p-4 text-left transition-colors hover:bg-[#1F1F35]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/15 glow-violet">
            <Globe className="h-5 w-5 text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <span className="font-heading text-sm font-semibold text-white">{ts('language')}</span>
            <p className="text-xs text-[#94A3B8]">{ts('languageDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#94A3B8]">
              {languages.find((l) => l.code === currentLang)?.label}
            </span>
            <ChevronRight className={`h-4 w-4 text-[#94A3B8] transition-transform ${showLangOptions ? 'rotate-90' : ''}`} />
          </div>
        </motion.button>

        {showLangOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-2"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.97 }}
                onClick={() => chooseLanguage(lang.code)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  currentLang === lang.code
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/10'
                    : 'border-[#262640] bg-[#12121F] hover:bg-[#1A1A2E]'
                }`}
              >
                <span className="font-heading text-sm font-medium text-white">{lang.label}</span>
                {currentLang === lang.code && <Check className="h-4 w-4 text-[#8B5CF6]" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Logout Section */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
            <LogOut className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <span className="font-heading text-sm font-semibold text-white">{ts('logout')}</span>
            <p className="text-xs text-[#94A3B8]">{ts('logoutDesc')}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
        </motion.button>
      </div>
    </motion.div>
  );
}
