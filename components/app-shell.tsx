'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import {
usePathname,
useRouter,
useSearchParams,
} from 'next/navigation';

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
House,
MessageSquare,
Calculator,
Code2,
Image as ImageIcon,
Mic,
PanelLeftClose,
PanelLeftOpen,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

import Logo from './logo';
import ProPill from './pro-pill';
import Avatar from './avatar';
import ProfileSheet from './profile-sheet';

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

const navigation = [
{ label: 'Home', icon: House, href: '/' },
{ label: 'Chat', icon: MessageSquare, href: '/chat' },
{ label: 'AI Solver', icon: Calculator, href: '/chat?tool=solve' },
{ label: 'Coding', icon: Code2, href: '/chat?tool=coding' },
];

const upcomingFeatures = [
{ label: 'Image Generation', icon: ImageIcon },
{ label: 'Live Voice Mode', icon: Mic },
];

export default function AppShell({
children,
}: {
children: ReactNode;
}) {
const [sheetOpen, setSheetOpen] = useState(false);
const [profileOpen, setProfileOpen] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

const pathname = usePathname() || '/';
const searchParams = useSearchParams();
const router = useRouter();

const { user, loading } = useAuth();

// Normalize pathname without regex
let normalizedPathname = pathname || '/';

while (
normalizedPathname.length > 1 &&
normalizedPathname.endsWith('/')
) {
normalizedPathname = normalizedPathname.slice(0, -1);
}

const isPublicPath = publicPaths.includes(normalizedPathname);
const isChatPage = normalizedPathname.endsWith('/chat');
const currentTool = searchParams.get('tool');

useEffect(() => {
if (loading || isPublicPath) return;

if (!user) {
  const langChosen =
    typeof window !== 'undefined' &&
    localStorage.getItem('aurexa_lang_chosen');

  router.replace(langChosen ? '/auth' : '/welcome');
}

}, [user, loading, isPublicPath, router]);

if (isPublicPath) {
return <>{children}</>;
}

if (loading || !user) {
return (
<div className="flex min-h-screen items-center justify-center bg-[#090817]">
<Sparkles className="h-8 w-8 text-violet-400" />
</div>
);
}

// Full-screen chat layout
if (isChatPage) {
return (
<div className="h-[100dvh] w-full overflow-hidden bg-[#090817]">
{children}
</div>
);
}

const isActive = (href: string) => {
if (href === '/') {
return normalizedPathname === '/';
}

if (href === '/chat') {
  return normalizedPathname === '/chat' && !currentTool;
}

if (href.includes('solve')) {
  return normalizedPathname === '/chat' && currentTool === 'solve';
}

if (href.includes('coding')) {
  return normalizedPathname === '/chat' && currentTool === 'coding';
}

return false;

};

const navigate = (href: string) => {
router.push(href);
setSheetOpen(false);
};

const SidebarContent = ({
mobile = false,
}: {
mobile?: boolean;
}) => (
<div className="flex h-full flex-col">

  {/* Brand */}
  <div className="border-b border-[#302852] px-5 py-5">
    <Logo />

    <div className="mt-3 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-violet-400" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
        Early Launch Stage
      </span>
    </div>
  </div>

  {/* Navigation */}
  <div className="flex-1 overflow-y-auto px-3 py-5">
    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8179a6]">
      Workspace
    </p>

    <div className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            aria-current={active ? 'page' : undefined}
            title={sidebarCollapsed && !mobile ? item.label : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
              active
                ? 'border border-violet-500/30 bg-violet-500/15 text-violet-200'
                : 'border border-transparent text-[#aaa2c8] hover:bg-[#171432] hover:text-white'
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />

            {(!sidebarCollapsed || mobile) && (
              <span>{item.label}</span>
            )}

            {active && (!sidebarCollapsed || mobile) && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
            )}
          </button>
        );
      })}
    </div>

    {/* Coming Soon */}
    {(!sidebarCollapsed || mobile) && (
      <>
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8179a6]">
          Coming Soon
        </p>

        <div className="space-y-1">
          {upcomingFeatures.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#77718f]"
                title="Coming Soon"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>

                <span className="ml-auto rounded-md border border-[#393052] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-300">
                  Soon
                </span>
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* Pro */}
    <div className="mt-8 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-300" />

        <span className="text-xs font-semibold text-violet-200">
          AUREXA PRO
        </span>
      </div>

      {(!sidebarCollapsed || mobile) && (
        <>
          <p className="mt-2 text-xs leading-relaxed text-[#aaa2c8]">
            Explore more possibilities with AUREXA AI.
          </p>

          <button
            onClick={() => navigate('/pricing')}
            className="mt-3 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500"
          >
            Explore Pro
          </button>
        </>
      )}
    </div>
  </div>

  {/* Social links */}
  {(!sidebarCollapsed || mobile) && (
    <div className="border-t border-[#302852] p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8179a6]">
        Connect with Founder
      </p>

      <div className="space-y-2">
        {socialLinks.map(({ name, username, url, Icon }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-2 text-[#aaa2c8] hover:bg-[#171432] hover:text-white"
          >
            <Icon className="h-4 w-4" />

            <span className="flex-1 text-xs">
              {username}
            </span>

            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-[#77718f]">
        AUREXA AI · Early Access
      </p>
    </div>
  )}
</div>

);

return (
<div className="min-h-screen bg-[#090817] text-[#f4f0ff]">

  {/* Header */}
  <header className="fixed left-0 right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#302852] bg-[#090817] px-4 md:px-6">
    <div className="flex items-center gap-4">

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#302852] bg-[#12102a] text-violet-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[290px] border-r border-[#302852] bg-[#090817] p-0 text-white"
          >
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar toggle */}
      <button
        onClick={() => setSidebarCollapsed((value) => !value)}
        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#302852] text-[#aaa2c8] hover:bg-[#171432] md:flex"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      <div className="hidden md:block">
        <Logo />
      </div>

      <div className="hidden h-6 w-px bg-[#302852] md:block" />

      <span className="hidden text-sm text-[#aaa2c8] md:block">
        AI Workspace
      </span>
    </div>

    {/* Account */}
    <div className="flex items-center gap-3">
      <ProPill />
      <Avatar onClick={() => setProfileOpen(true)} />
    </div>
  </header>

  {/* Desktop sidebar */}
  <aside
    className={`fixed bottom-0 left-0 top-[68px] z-30 hidden border-r border-[#302852] bg-[#0d0b20] transition-none md:block ${
      sidebarCollapsed ? 'w-[76px]' : 'w-[250px]'
    }`}
  >
    <SidebarContent />
  </aside>

  {/* Main content */}
  <main
    className={`min-h-screen pt-[68px] transition-none ${
      sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[250px]'
    }`}
  >
    <div className="min-h-[calc(100vh-68px)] px-4 py-5 md:px-7 md:py-7">
      {children}
    </div>
  </main>

  {/* Profile */}
  <ProfileSheet
    open={profileOpen}
    onClose={() => setProfileOpen(false)}
  />
</div>

);
}
