'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, X, Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';

const languageLabels: Record<string, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
  hi: 'हिन्दी',
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const t = useTranslations('settings');

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const photoURL = user?.photoURL;
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const lang = getCookie('aurexa_lang') || 'en';

  const handleSettings = () => {
    onClose();
    router.push('/settings');
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    router.push('/auth');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border border-[#262640] bg-[#12121F] p-6 pb-8"
          >
            <div className="flex justify-center pb-2">
              <div className="h-1 w-10 rounded-full bg-[#262640]" />
            </div>

            <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#1A1A2E] hover:text-white">
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#262640]">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <h2 className="font-heading text-lg font-bold text-white">{displayName}</h2>
                <p className="text-sm text-[#94A3B8]">{email}</p>
              </div>

              <div className="flex w-full gap-2">
                <div className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-[#262640] bg-[#1A1A2E] py-3">
                  <span className="text-xs text-[#94A3B8]">Plan</span>
                  <div className="flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 text-[#8B5CF6]" />
                    <span className="font-heading text-sm font-semibold text-white">Free</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-[#262640] bg-[#1A1A2E] py-3">
                  <span className="text-xs text-[#94A3B8]">Language</span>
                  <span className="font-heading text-sm font-semibold text-white">{languageLabels[lang] || 'English'}</span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 pt-2">
                <button
                  onClick={handleSettings}
                  className="flex items-center gap-3 rounded-xl border border-[#262640] bg-[#1A1A2E] px-4 py-3 text-left transition-colors hover:bg-[#1F1F35]"
                >
                  <Settings className="h-5 w-5 text-[#8B5CF6]" />
                  <span className="flex-1 text-sm font-medium text-white">{t('language')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span className="flex-1 text-sm font-medium text-white">{t('logout')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
