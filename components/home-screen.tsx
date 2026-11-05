'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Sparkles,
  Send,
  Code2,
  Image as ImageIcon,
  Crown,
  MessageCircle,
  Lightbulb,
  Video,
  Scissors,
  GraduationCap,
  ArrowUpRight,
  Clock3,
  Zap,
  ShieldCheck,
  X,
  Mic,
  Home,
  History,
  Settings,
  ChevronRight,
  Menu,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

type Feature = {
  key: string;
  icon: typeof MessageCircle;
  tool?: string;
  comingSoon?: boolean;
};

const features: Feature[] = [
  { key: 'chat', icon: MessageCircle, tool: 'chat' },
  { key: 'solve', icon: Lightbulb, tool: 'solve' },
  { key: 'coding', icon: Code2, tool: 'coding' },
  { key: 'image', icon: ImageIcon, comingSoon: true },
  { key: 'video', icon: Video, comingSoon: true },
  { key: 'editor', icon: Scissors, comingSoon: true },
  { key: 'courses', icon: GraduationCap, comingSoon: true },
  { key: 'voice', icon: Mic, comingSoon: true },
];

function routeToChat(
  router: ReturnType<typeof useRouter>,
  prompt: string,
  selectedTool?: string,
) {
  const text = prompt.trim();

  if (!text) {
    router.push('/chat');
    return;
  }

  let tool = selectedTool;

  if (!tool) {
    const lower = text.toLowerCase();

    if (
      lower.includes('code') ||
      lower.includes('program') ||
      lower.includes('debug') ||
      lower.includes('function') ||
      lower.includes('javascript') ||
      lower.includes('python')
    ) {
      tool = 'coding';
    } else if (
      lower.includes('solve') ||
      lower.includes('math') ||
      lower.includes('calculate') ||
      lower.includes('equation')
    ) {
      tool = 'solve';
    } else {
      tool = 'chat';
    }
  }

  router.push(
    `/chat?q=${encodeURIComponent(text)}&tool=${encodeURIComponent(tool)}`,
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const t = useTranslations('home');
  const tf = useTranslations('features');
  const tp = useTranslations('pro');
  const locale = useLocale();

  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.displayName || t('username');

  function getGreeting() {
    const hour = Number(
      new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(new Date()),
    );

    const greetings: Record<string, string[]> = {
      en: ['Good Morning,', 'Good Afternoon,', 'Good Evening,', 'Good Night,'],
      kn: ['ಶುಭೋದಯ,', 'ಶುಭ ಮಧ್ಯಾಹ್ನ,', 'ಶುಭ ಸಂಜೆ,', 'ಶುಭ ರಾತ್ರಿ,'],
      hi: ['सुप्रभात,', 'शुभ दोपहर,', 'शुभ संध्या,', 'शुभ रात्रि,'],
    };

    const index =
      hour >= 5 && hour < 12 ? 0 :
      hour >= 12 && hour < 17 ? 1 :
      hour >= 17 && hour < 21 ? 2 : 3;

    return (greetings[locale.split('-')[0]] || greetings.en)[index];
  }

  function handleAsk(event?: React.FormEvent) {
    event?.preventDefault();

    if (!prompt.trim()) return;

    routeToChat(router, prompt);
  }

  function handleFeatureClick(feature: Feature) {
    if (feature.tool) {
      router.push(`/chat?tool=${encodeURIComponent(feature.tool)}`);
      return;
    }

    setNotice(feature.key);
  }

  const noticeText =
    notice === 'voice'
      ? 'Live Voice Mode is being prepared for AUREXA AI.'
      : notice === 'image'
        ? 'AI Image Generation is coming soon.'
        : notice === 'video'
          ? 'AI Video Generation is coming soon.'
          : notice
            ? `${notice.charAt(0).toUpperCase()}${notice.slice(1)} is coming soon.`
            : '';

  return (
    <main className="min-h-screen bg-[#fbf9f5] text-[#241d14]">

      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* MOBILE HEADER */}
        <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-[#eadfc9] bg-white px-4 py-3 lg:hidden">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open menu"
            className="rounded-xl border border-[#eadfc9] p-2"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#bd8627]" />
            <span className="font-bold tracking-wider">
              AUREXA <span className="text-[#bd8627]">AI</span>
            </span>
          </div>

          <button
            onClick={() => router.push('/pricing')}
            className="rounded-full bg-[#bd8627] px-3 py-2 text-xs font-bold text-white"
          >
            PRO
          </button>
        </div>

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#eadfc9] bg-white p-5 transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >

          <div className="mb-10 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbf3e3]">
                <Sparkles className="h-6 w-6 text-[#bd8627]" />
              </div>

              <div>
                <p className="font-bold tracking-[0.14em]">
                  AUREXA <span className="text-[#bd8627]">AI</span>
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#99866a]">
                  Intelligence Platform
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a18c68]">
            Workspace
          </p>

          <nav className="space-y-1">

            <button
              onClick={() => {
                router.push('/');
                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-[#f8f1e4] px-4 py-3 text-sm font-semibold text-[#956a20]"
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            <button
              onClick={() => router.push('/chat')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <MessageCircle className="h-4 w-4" />
              AI Chat
            </button>

            <button
              onClick={() => router.push('/chat?tool=solve')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <Lightbulb className="h-4 w-4" />
              AI Solver
            </button>

            <button
              onClick={() => router.push('/chat?tool=coding')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <Code2 className="h-4 w-4" />
              Coding Assistant
            </button>

            <button
              onClick={() => setNotice('voice')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <Mic className="h-4 w-4" />
              Live Voice Mode
              <span className="ml-auto rounded-full bg-[#fbf3e3] px-2 py-1 text-[9px] text-[#a17a35]">
                Soon
              </span>
            </button>

          </nav>

          <div className="my-7 border-t border-[#eee5d6]" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a18c68]">
            Account
          </p>

          <nav className="space-y-1">

            <button
              onClick={() => router.push('/chat')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <History className="h-4 w-4" />
              Chat History
            </button>

            <button
              onClick={() => router.push('/pricing')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </button>

            <button
              onClick={() => setNotice('settings')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#766b59] hover:bg-[#faf7f0]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

          </nav>

          <div className="mt-auto rounded-2xl border border-[#eadfc9] bg-[#fbf8f1] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#bd8627]" />
              <span className="text-xs font-semibold">Early Launch</span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#8c806c]">
              AUREXA AI is currently in its early launch and testing stage.
            </p>
          </div>

        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <button
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-7 lg:px-10 lg:pt-8">

          {/* TOP BAR */}
          <header className="hidden items-center justify-between lg:flex">
            <div>
              <p className="text-sm text-[#93836b]">
                AUREXA AI Workspace
              </p>
              <p className="mt-1 text-xs text-[#b0a38f]">
                Your intelligent creative space
              </p>
            </div>

            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center gap-2 rounded-full border border-[#d9b96e] bg-gradient-to-r from-[#f5dfa8] to-[#c79535] px-5 py-2.5 text-xs font-bold text-[#4c3510]"
            >
              <Crown className="h-4 w-4" />
              UPGRADE TO PRO
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </header>

          {/* HERO */}
          <section className="mx-auto mt-8 max-w-4xl text-center lg:mt-16">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#e6d4a9] bg-white shadow-[0_8px_25px_rgba(171,128,48,0.12)]">
              <Sparkles className="h-8 w-8 text-[#bd8627]" />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4d2a9] bg-white px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7040]">
                Your AI Workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {getGreeting()}{' '}
              <span className="text-[#bd8627]">
                {displayName}
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#817565] sm:text-base">
              {t('sub')}
            </p>

            {/* PROMPT BOX */}
            <form
              onSubmit={handleAsk}
              className="mx-auto mt-8 max-w-3xl rounded-[24px] border border-[#e6d6b5] bg-white p-3 text-left shadow-[0_12px_40px_rgba(143,105,43,0.09)] focus-within:border-[#c49a48]"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="ml-2 h-5 w-5 shrink-0 text-[#bd8627]" />

                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={t('askPlaceholder')}
                  aria-label={t('askPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#a99b84] sm:text-base"
                />

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  aria-label="Send prompt"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#bd8627] text-white disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-[#eee4d1] px-2 pt-3">
                <div className="flex items-center gap-2 text-[10px] text-[#94866f]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Ready when you are
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#92733c]">
                  <Zap className="h-3.5 w-3.5 text-[#bd8627]" />
                  AI Powered
                </div>
              </div>
            </form>

          </section>

          {/* EARLY ACCESS STATS */}
          <section className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-4">

            <div className="rounded-2xl border border-[#e6d6b5] bg-white p-5 text-center">
              <p className="text-3xl font-extrabold text-[#bd8627] sm:text-4xl">
                13K+
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#80683e] sm:text-xs">
                Early Access Trials
              </p>
            </div>

            <div className="rounded-2xl border border-[#e6d6b5] bg-white p-5 text-center">
              <p className="text-2xl font-extrabold text-[#bd8627] sm:text-3xl">
                EARLY
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#80683e] sm:text-xs">
                Testing Stage
              </p>
            </div>

          </section>

          {/* FEATURES */}
          <section className="mt-14">

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a17a35]">
                EXPLORE WORKSPACE
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {t('explore')}
              </h2>

              <p className="mt-2 text-sm text-[#8c806c]">
                Explore the tools available in AUREXA AI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <button
                    key={feature.key}
                    type="button"
                    onClick={() => handleFeatureClick(feature)}
                    className="group min-h-[190px] rounded-2xl border border-[#e7d9bd] bg-white p-5 text-left shadow-sm hover:border-[#cda34d] hover:bg-[#fffdf8]"
                  >

                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ead9b4] bg-[#fbf3e3]">
                        <Icon className="h-5 w-5 text-[#bd8627]" />
                      </div>

                      {feature.comingSoon ? (
                        <span className="rounded-full border border-[#e8d8b6] bg-[#fbf5e9] px-3 py-1 text-[9px] text-[#9a7c45]">
                          Coming Soon
                        </span>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-[#a58a58]" />
                      )}
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-[#292116]">
                      {feature.key === 'voice'
                        ? 'Live Voice Mode'
                        : tf(`${feature.key}.title`)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#8c806c]">
                      {feature.key === 'voice'
                        ? 'Talk naturally with AUREXA AI using your voice.'
                        : tf(`${feature.key}.desc`)}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#a47b32]">
                      {feature.comingSoon ? 'Coming Soon' : 'Open Tool'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>

                  </button>
                );
              })}

            </div>
          </section>

          {/* PRO BANNER */}
          <section className="mt-10">

            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="w-full rounded-3xl border border-[#ddc28a] bg-gradient-to-r from-[#fffaf0] via-[#f8edcf] to-[#f1dfb5] p-6 text-left hover:border-[#c49a48]"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7df9f] to-[#bd8627]">
                  <Crown className="h-7 w-7 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a47a2e]">
                    AUREXA AI PRO
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-[#342613]">
                    {tp('title')}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#897653]">
                    {tp('desc')}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#986b1d]">
                    {tp('cta')}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>

                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#a17b3b]" />

              </div>

            </button>

          </section>

          {/* RECENT CHAT */}
          <section className="mt-10">

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#bd8627]" />
                <h2 className="text-sm font-semibold">
                  {t('recent')}
                </h2>
              </div>

              <button
                onClick={() => router.push('/chat')}
                className="flex items-center gap-1 text-xs text-[#a47b32]"
              >
                {t('viewAll')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => router.push('/chat')}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#e8dcc5] bg-white p-4 text-left hover:border-[#cda34d]"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fbf3e3]">
                <MessageCircle className="h-5 w-5 text-[#bd8627]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {t('recentNewChat')}
                </p>

                <p className="mt-1 truncate text-xs text-[#978a75]">
                  {t('recentChatDesc')}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-[#b29a6d]" />

            </button>

          </section>

          {/* FOOTER */}
          <footer className="mt-12 border-t border-[#e8dcc5] pt-6 text-center">

            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#bd8627]" />
              <span className="text-xs font-bold tracking-[0.2em]">
                AUREXA AI
              </span>
            </div>

            <p className="mt-2 text-[10px] text-[#a69a86]">
              Built for ideas. Designed for possibilities.
            </p>

          </footer>

        </div>
      </div>

      {/* NOTIFICATION */}
      {notice && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-5"
          onClick={() => setNotice('')}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            className="w-full max-w-sm rounded-3xl border border-[#e4d1a6] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf3e3]">
                <Sparkles className="h-6 w-6 text-[#bd8627]" />
              </div>

              <button
                onClick={() => setNotice('')}
                aria-label="Close notification"
                className="rounded-xl p-2 text-[#98866b] hover:bg-[#f7efdf]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2
              id="notice-title"
              className="mt-5 text-xl font-semibold"
            >
              Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#84745c]">
              {noticeText} We are working to bring more features to AUREXA AI.
            </p>

            <button
              onClick={() => setNotice('')}
              className="mt-5 w-full rounded-xl bg-[#bd8627] px-4 py-3 text-sm font-semibold text-white"
            >
              Got it
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
