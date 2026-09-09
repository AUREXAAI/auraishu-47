'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import Logo from '@/components/logo';
import { useAuth } from '@/lib/auth-context';

export default function AuthPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const { signUpWithEmail, signInWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050D]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center gap-2">
            <Logo />
            <p className="text-sm text-[#94A3B8]">{t('tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            {mode === 'signup' && (
              <div className="flex items-center gap-3 rounded-full border border-[#262640] bg-[#12121F] px-4 py-3">
                <UserIcon className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            )}
            <div className="flex items-center gap-3 rounded-full border border-[#262640] bg-[#12121F] px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#94A3B8] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[#262640] bg-[#12121F] px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#94A3B8] focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 font-heading text-sm font-semibold text-white glow-violet disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signup' ? t('signUp') : t('signIn')}
            </motion.button>
          </form>

          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-sm text-[#94A3B8]"
          >
            {mode === 'signup' ? t('haveAccount') : t('noAccount')}{' '}
            <span className="font-medium text-[#8B5CF6]">
              {mode === 'signup' ? t('signInLink') : t('signUpLink')}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
          }
