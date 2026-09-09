'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, LayoutGrid, Folder, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'home', href: '/', icon: Home },
  { key: 'chat', href: '/chat', icon: MessageCircle },
  { key: 'tools', href: '/tools', icon: LayoutGrid },
  { key: 'library', href: '/library', icon: Folder },
  { key: 'settings', href: '/settings', icon: Settings },
] as const;

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2">
      <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl border border-[#262640] bg-[#12121F]/90 px-2 py-2 backdrop-blur-xl">
        {tabs.map(({ key, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={key} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors',
                  isActive ? 'text-white' : 'text-[#94A3B8]'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                    isActive && 'bg-brand-gradient glow-violet'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn('font-heading text-[10px] font-semibold', isActive && 'text-gradient')}>
                  {t(key)}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
