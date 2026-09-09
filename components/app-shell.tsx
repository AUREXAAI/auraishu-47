'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Logo from './logo';
import ProPill from './pro-pill';
import Avatar from './avatar';
import BottomNav from './bottom-nav';
import ProfileSheet from './profile-sheet';
import { useAuth } from '@/lib/auth-context';

const publicPaths = ['/auth', '/welcome'];

export default function AppShell({ children }: { children: React.ReactNode }) {
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
      const langChosen = typeof window !== 'undefined' && localStorage.getItem('aurexa_lang_chosen');
      router.push(langChosen ? '/auth' : '/welcome');
    }
  }, [user, loading, isPublicPath, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05050D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262640] border-t-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050D] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#262640]/50 bg-[#05050D]/80 px-4 py-3 backdrop-blur-xl">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-[#1A1A2E] hover:text-white">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-[#262640] bg-[#12121F]">
              <div className="mt-6 flex flex-col gap-4">
                <Logo />
                <p className="text-sm text-[#94A3B8]">{t('tagline')}</p>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <ProPill />
            <Avatar onClick={() => setProfileOpen(true)} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 scrollbar-hide">
          {children}
        </main>

        <BottomNav />
      </div>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
