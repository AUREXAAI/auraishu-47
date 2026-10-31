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

  const isPublicPath = publicPaths.includes(pathname);

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
      <div className="flex min-h-screen items-center justify-center bg-[#101012]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#343438] border-t-[#D6BC86]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[#F5F1E8]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">

        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#343438]/50 bg-[#101012]/80 px-4 py-3 backdrop-blur-xl">

          {/* Menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#B7B2A8] transition-colors hover:bg-[#242428] hover:text-[#F5F1E8]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[280px] border-[#343438] bg-[#1C1C20] text-[#F5F1E8]"
            >
              <div className="mt-6 flex flex-col gap-4">

                <Logo />

                <p className="text-sm text-[#B7B2A8]">
                  {t('tagline')}
                </p>

                <div className="my-2 border-t border-[#343438]" />

                {/* Social Links */}
                <p className="text-xs font-semibold uppercase tracking-widest text-[#D6BC86]">
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
                        className="flex items-center justify-between rounded-xl border border-[#343438] bg-[#242428] p-3 transition-all hover:border-[#D6BC86]/60 hover:bg-[#303035]"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-[#D6BC86]" />

                          <div>
                            <p className="text-sm font-medium text-[#F5F1E8]">
                              {name}
                            </p>

                            <p className="text-xs text-[#B7B2A8]">
                              {username}
                            </p>
                          </div>
                        </div>

                        <ExternalLink className="h-4 w-4 text-[#8D887F]" />
                      </a>
                    )
                  )}
                </div>

                {/* Founder Information */}
                <div className="mt-3 border-t border-[#343438] pt-4">
                  <p className="text-xs text-[#8D887F]">
                    AUREXA AI
                  </p>

                  <p className="mt-1 text-xs text-[#B7B2A8]">
                    Built by Ishant V Naik
                  </p>
                </div>

              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <ProPill />

            <Avatar
              onClick={() => setProfileOpen(true)}
            />
          </div>

        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

      </div>

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

    </div>
  );
         }
