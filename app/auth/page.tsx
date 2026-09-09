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
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();

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

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
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

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-gradient px-6 py-3.5 font-heading text-sm font-semibold text-white glow-violet disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('google')}
          </motion.button>

          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-[#262640]" />
            <span className="text-xs text-[#94A3B8]">{t('or')}</span>
            <div className="h-px flex-1 bg-[#262640]" />
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
