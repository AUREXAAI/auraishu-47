'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Menu,
  Linkedin,
  Instagram,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

import { useTranslations } from 'next-intl';

import Logo from './logo';
import ProPill from './pro-pill';
import Avatar from './avatar';
import BottomNav from './bottom-nav';
import ProfileSheet from './profile-sheet';

import { useAuth } from '@/lib/auth-context';

const publicPaths = ['/auth', '/welcome'];

const socialLinks = [
  {
    name: 'LinkedIn',
    username: 'Ishant V Naik',
    url: 'https://www.linkedin.com/in/ishant-v-naik-002227446/',
    Icon: Linkedin,
  },
  {
    name: 'Instagram',
    username: '@1sh4nt_n41k',
    url: 'https://www.instagram.com/1sh4nt_n41k/',
    Icon: Instagram,
  },
];

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations('header');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { user, loading } = useAuth();

  const normalizedPathname = pathname.replace(/\/+$/, '');

  const isPublicPath = publicPaths.includes(normalizedPathname);

  const isChatPage =
    normalizedPathname === '/chat' ||
    normalizedPathname.endsWith('/chat');

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      const langChosen =
        typeof window !== 'undefined' &&
        localStorage.getItem('aurexa_lang_chosen');

      router.push(langChosen ? '/auth' : '/welcome');
    }
  }, [user, loading, isPublicPath, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e8dcc2] bg-white/80 shadow-[0_8px_35px_rgba(184,151,91,0.12)] backdrop-blur-xl">
          <Sparkles className="h-7 w-7 animate-pulse text-[#b99a62]" />
          <span className="absolute -bottom-2 h-1 w-8 animate-pulse rounded-full bg-[#c8aa76]/50 blur-sm" />
        </div>
      </div>
    );
  }

  // Independent full-screen chat layout
  if (isChatPage) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-[#faf9f6]">
        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf9f6] text-[#292720]">

      {/* Background glass decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#e9d9b8]/20 blur-[100px]" />
        <div className="absolute -right-32 top-64 h-80 w-80 rounded-full bg-[#d9c49d]/20 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#f0e7d5]/40 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col">

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[#e8e0d2]/70 bg-white/65 px-4 py-3 shadow-[0_4px_25px_rgba(80,65,40,0.035)] backdrop-blur-2xl">

          <div className="flex items-center justify-between">

            {/* Menu */}
            <Sheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
            >
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e1d3]/80 bg-white/70 text-[#8e7955] shadow-sm transition-all duration-300 hover:border-[#cbb384] hover:bg-white active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[290px] border-r border-[#e8deca] bg-[#faf9f6]/95 p-5 text-[#292720] shadow-[15px_0_50px_rgba(80,65,40,0.08)] backdrop-blur-2xl"
              >
                <div className="mt-6 flex flex-col gap-5">

                  {/* Brand */}
                  <div className="rounded-2xl border border-[#e9dfce] bg-white/75 p-4 shadow-[0_8px_30px_rgba(80,65,40,0.04)]">
                    <Logo />

                    <p className="mt-2 text-xs leading-relaxed text-[#8d867a]">
                      {t('tagline')}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#b99a62]" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a58a5c]">
                        Early Testing Stage
                      </span>
                    </div>
                  </div>

                  {/* Social links */}
                  <div>
                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a58a5c]">
                      Connect with Founder
                    </p>

                    <div className="flex flex-col gap-3">
                      {socialLinks.map(
                        ({ name, username, url, Icon }) => (
                          <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setSheetOpen(false)}
                            className="group flex items-center justify-between rounded-2xl border border-[#e9e1d3] bg-white/70 p-3.5 shadow-[0_5px_20px_rgba(80,65,40,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cbb384] hover:bg-white hover:shadow-[0_10px_25px_rgba(184,151,91,0.10)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee4d2] bg-[#f8f4ec]">
                                <Icon className="h-5 w-5 text-[#ad905d]" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-[#39352d]">
                                  {name}
                                </p>

                                <p className="mt-0.5 text-xs text-[#999184]">
                                  {username}
                                </p>
                              </div>
                            </div>

                            <ExternalLink className="h-4 w-4 text-[#b8ad9a] transition-colors group-hover:text-[#a58a5c]" />
                          </a>
                        )
                      )}
                    </div>
                  </div>

                  {/* Founder information */}
                  <div className="mt-2 rounded-2xl border border-[#e9dfce] bg-gradient-to-br from-white/90 to-[#f4eee2]/80 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#b99a62]" />
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9d8254]">
                        AUREXA AI
                      </p>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#39352d]">
                      Built by Ishant V Naik
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-[#918879]">
                      Imagine. Innovate. Build.
                    </p>
                  </div>

                  <p className="mt-auto pt-3 text-center text-[10px] tracking-wide text-[#aaa294]">
                    AUREXA AI · Early Access
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center justify-center">
              <Logo />
            </div>

            {/* Account controls */}
            <div className="flex items-center gap-2">
              <ProPill />

              <button
                aria-label="Open profile"
                onClick={() => setProfileOpen(true)}
                className="rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Avatar />
              </button>
            </div>

          </div>
        </header>

        {/* Main content */}
        <main className="relative flex-1 overflow-y-auto px-4 pb-28 pt-5 scrollbar-hide">
          {children}
        </main>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md">
          <div className="border-t border-[#e8e0d2]/70 bg-white/75 shadow-[0_-8px_30px_rgba(80,65,40,0.045)] backdrop-blur-2xl">
            <BottomNav />
          </div>
        </div>

      </div>

      {/* Profile */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
