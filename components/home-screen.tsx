'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Home,
  MessageCircle,
  Lightbulb,
  Code2,
  Mic,
  Image as ImageIcon,
  History,
  Crown,
  Settings,
  Menu,
  X,
  Send,
  Sparkles,
  Video,
  Scissors,
  GraduationCap,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Zap,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

type NavItem = {
  label: string;
  icon: typeof Home;
  action: () => void;
  comingSoon?: boolean;
};

const upcomingFeatures = [
  {
    title: 'Video AI',
    description: 'Create and explore AI-powered video tools.',
    icon: Video,
    status: 'COMING SOON',
  },
  {
    title: 'AI Editor',
    description: 'An intelligent workspace for your creative projects.',
    icon: Scissors,
    status: 'IN DEVELOPMENT',
  },
  {
    title: 'AI Courses',
    description: 'Learn AI and modern technology step by step.',
    icon: GraduationCap,
    status: 'COMING SOON',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const t = useTranslations('home');
  const tp = useTranslations('pro');
  const locale = useLocale();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const displayName = user?.displayName || t('username');

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (locale === 'kn') {
      if (hour < 12) return 'ಶುಭೋದಯ';
      if (hour < 17) return 'ಶುಭ ಮಧ್ಯಾಹ್ನ';
      return 'ಶುಭ ಸಂಜೆ';
    }

    if (locale === 'hi') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'नमस्कार';
      return 'शुभ संध्या';
    }

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const routeToChat = (text: string, tool = 'chat') => {
    const value = text.trim();

    if (!value) return;

    router.push(
      `/chat?q=${encodeURIComponent(value)}&tool=${encodeURIComponent(tool)}`
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = prompt.trim();
    if (!value) return;

    const lower = value.toLowerCase();

    let tool = 'chat';

    if (
      lower.includes('code') ||
      lower.includes('program') ||
      lower.includes('javascript') ||
      lower.includes('python') ||
      lower.includes('debug')
    ) {
      tool = 'coding';
    } else if (
      lower.includes('solve') ||
      lower.includes('math') ||
      lower.includes('calculate') ||
      lower.includes('equation')
    ) {
      tool = 'solve';
    }

    routeToChat(value, tool);
  };

  const showComingSoon = (feature: string) => {
    setNotice(`${feature} is currently in development.`);
    setMobileMenuOpen(false);
  };

  const navItems: NavItem[] = [
    {
      label: 'Home',
      icon: Home,
      action: () => router.push('/'),
    },
    {
      label: 'AI Chat',
      icon: MessageCircle,
      action: () => router.push('/chat'),
    },
    {
      label: 'AI Solver',
      icon: Lightbulb,
      action: () => router.push('/chat?tool=solve'),
    },
    {
      label: 'Coding Assistant',
      icon: Code2,
      action: () => router.push('/chat?tool=coding'),
    },
    {
      label: 'Live Voice Mode',
      icon: Mic,
      action: () => showComingSoon('Live Voice Mode'),
      comingSoon: true,
    },
    {
      label: 'Image Generation',
      icon: ImageIcon,
      action: () => showComingSoon('Image Generation'),
      comingSoon: true,
    },
    {
      label: 'Chat History',
      icon: History,
      action: () => router.push('/chat'),
    },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#211b14]">

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#eadfc9] bg-white/95 px-4 backdrop-blur md:hidden">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
          aria-label="AUREXA AI Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4d995] to-[#bd8627] text-white">
            <Sparkles size={19} />
          </div>
          <span className="text-lg font-bold tracking-wide">
            AUREXA <span className="text-[#bd8627]">AI</span>
          </span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-[#eadfc9] p-2"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
            border-r border-[#eadfc9] bg-white
            transition-transform duration-200
            md:sticky md:top-0 md:h-screen md:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* LOGO */}
          <div className="flex h-[76px] items-center justify-between border-b border-[#f0e8db] px-6">
            <button
              onClick={() => {
                router.push('/');
                closeMobileMenu();
              }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4d995] to-[#bd8627] text-white">
                <Sparkles size={21} />
              </div>

              <div className="text-left">
                <h1 className="text-[17px] font-bold tracking-wide">
                  AUREXA <span className="text-[#bd8627]">AI</span>
                </h1>
                <p className="text-[10px] font-medium tracking-[2px] text-[#998a74]">
                  INTELLIGENCE REIMAGINED
                </p>
              </div>
            </button>

            <button
              onClick={closeMobileMenu}
              className="rounded-lg p-2 text-[#817565] md:hidden"
              aria-label="Close sidebar"
            >
              <X size={19} />
            </button>
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#a49680]">
              Workspace
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      closeMobileMenu();
                    }}
                    className={`
                      flex w-full items-center justify-between rounded-xl
                      px-3 py-3 text-left text-[13px] font-medium
                      transition-colors
                      ${
                        item.label === 'Home'
                          ? 'bg-[#fbf4e6] text-[#a87520]'
                          : 'text-[#716656] hover:bg-[#faf7f1] hover:text-[#211b14]'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} strokeWidth={1.8} />
                      {item.label}
                    </span>

                    {item.comingSoon && (
                      <span className="rounded-md bg-[#f6f0e5] px-1.5 py-1 text-[8px] font-bold text-[#a87520]">
                        SOON
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="my-6 border-t border-[#f0e8db]" />

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#a49680]">
              Account
            </p>

            <button
              onClick={() => router.push('/pricing')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#716656] hover:bg-[#faf7f1]"
            >
              <Crown size={18} />
              Upgrade to Pro
              <ChevronRight className="ml-auto" size={15} />
            </button>

            <button
              onClick={() => showComingSoon('Settings')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#716656] hover:bg-[#faf7f1]"
            >
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="border-t border-[#f0e8db] p-4">
            <div className="rounded-xl border border-[#eadfc9] bg-[#fdfaf4] p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#bd8627]" />
                <span className="text-xs font-semibold">Early Launch Stage</span>
              </div>
              <p className="mt-1 text-[10px] leading-5 text-[#817565]">
                AUREXA AI is currently in early testing.
              </p>
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {mobileMenuOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={closeMobileMenu}
            aria-label="Close navigation overlay"
          />
        )}

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 md:px-10 md:py-12">

            {/* TOP BAR */}
            <div className="mb-12 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#a49680]">
                  AUREXA AI / HOME
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-[#eadfc9] bg-white px-4 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#bd9b53]" />
                <span className="text-[11px] font-medium text-[#817565]">
                  Early Launch Stage
                </span>
              </div>
            </div>

            {/* GREETING */}
            <section className="mx-auto max-w-[850px] text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-white px-4 py-2">
                <Sparkles size={14} className="text-[#bd8627]" />
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#98733b]">
                  Your AI Workspace
                </span>
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {getGreeting()},{' '}
                <span className="text-[#bd8627]">{displayName}</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#817565] sm:text-base">
                What would you like to explore today?
                <br className="hidden sm:block" />
                Ask, create, learn and build with AUREXA AI.
              </p>

              {/* PROMPT BOX */}
              <form
                onSubmit={handleSubmit}
                className="mt-10 rounded-2xl border border-[#e8dcc6] bg-white p-3 shadow-[0_12px_45px_rgba(120,90,40,0.07)] sm:p-4"
              >
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      routeToChat(prompt);
                    }
                  }}
                  placeholder={t('askPlaceholder')}
                  rows={3}
                  className="w-full resize-none border-0 bg-transparent px-2 py-3 text-sm text-[#211b14] outline-none placeholder:text-[#b0a594] focus:ring-0"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e8db] pt-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPrompt('Explain this topic step by step.')
                      }
                      className="rounded-lg bg-[#fbf7ef] px-3 py-2 text-[11px] font-medium text-[#8c6b35] hover:bg-[#f5ecd9]"
                    >
                      <Lightbulb className="mr-1 inline" size={13} />
                      Explain
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPrompt('Help me write and understand this code.')
                      }
                      className="rounded-lg bg-[#fbf7ef] px-3 py-2 text-[11px] font-medium text-[#8c6b35] hover:bg-[#f5ecd9]"
                    >
                      <Code2 className="mr-1 inline" size={13} />
                      Write code
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPrompt('Help me solve this problem step by step.')
                      }
                      className="rounded-lg bg-[#fbf7ef] px-3 py-2 text-[11px] font-medium text-[#8c6b35] hover:bg-[#f5ecd9]"
                    >
                      <Zap className="mr-1 inline" size={13} />
                      Solve
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e9c879] to-[#bd8627] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Start Chat
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </section>

            {/* EARLY ACCESS STATS */}
            <section className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfc9] bg-white p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf3e3] text-[#bd8627]">
                  <Zap size={22} />
                </div>

                <div>
                  <p className="text-2xl font-bold">13K+</p>
                  <p className="mt-1 text-xs text-[#817565]">
                    Early Access Trials
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfc9] bg-white p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf3e3] text-[#bd8627]">
                  <Clock3 size={22} />
                </div>

                <div>
                  <p className="text-base font-bold">Early Launch</p>
                  <p className="mt-1 text-xs text-[#817565]">
                    Features are being tested and improved.
                  </p>
                </div>
              </div>
            </section>

            {/* UPCOMING FEATURES SLIDER */}
            <section className="mt-14">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#bd8627]">
                    What's next
                  </p>
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    Explore what's coming
                  </h3>
                  <p className="mt-2 text-xs text-[#817565]">
                    New experiences currently in development.
                  </p>
                </div>

                <span className="hidden text-xs text-[#a49680] sm:block">
                  More features ahead
                </span>
              </div>

              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
                {upcomingFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="w-[260px] shrink-0 snap-start rounded-2xl border border-[#eadfc9] bg-white p-5 sm:w-[290px]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf3e3] text-[#bd8627]">
                          <Icon size={21} />
                        </div>

                        <span className="rounded-md bg-[#f8f1e3] px-2 py-1 text-[8px] font-bold tracking-wide text-[#a87520]">
                          {feature.status}
                        </span>
                      </div>

                      <h4 className="mt-5 text-base font-semibold">
                        {feature.title}
                      </h4>

                      <p className="mt-2 min-h-[42px] text-xs leading-5 text-[#817565]">
                        {feature.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-[#bd8627]">
                        In development
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PRO BANNER */}
            <section className="mt-10 overflow-hidden rounded-2xl border border-[#e8d5ad] bg-gradient-to-r from-[#fff9eb] to-[#f7edda] p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#bd8627]">
                  <Crown size={23} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    {tp('title')}
                  </h3>
                  <p className="mt-2 max-w-lg text-xs leading-6 text-[#817565]">
                    {tp('desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/pricing')}
                className="mt-5 flex shrink-0 items-center gap-2 rounded-xl bg-[#bd8627] px-5 py-3 text-xs font-bold text-white sm:mt-0"
              >
                {tp('cta')}
                <ArrowRight size={14} />
              </button>
            </section>

            {/* FOOTER */}
            <footer className="mt-12 border-t border-[#eadfc9] py-6 text-center">
              <p className="text-[10px] tracking-wide text-[#a49680]">
                © {new Date().getFullYear()} AUREXA AI. All rights reserved.
              </p>
              <p className="mt-2 text-[10px] text-[#b0a594]">
                Built for a more accessible AI experience.
              </p>
            </footer>

          </div>
        </main>
      </div>

      {/* NOTICE */}
      {notice && (
        <div className="fixed bottom-5 left-1/2 z-[60] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-[#eadfc9] bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-[#bd8627]" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">{notice}</p>
              <p className="mt-1 text-[10px] text-[#817565]">
                This feature is not available yet.
              </p>
            </div>

            <button
              onClick={() => setNotice('')}
              className="text-[#817565]"
              aria-label="Dismiss notice"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
