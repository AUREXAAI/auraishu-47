'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import {
  Sparkles,
  Send,
  Lightbulb,
  Code2,
  Zap,
  Clock3,
  Video,
  Scissors,
  GraduationCap,
  ArrowUpRight,
  Crown,
  Image as ImageIcon,
  Mic,
  Languages,
  MessageCircle,
  Calculator,
  CheckCircle2,
  Infinity,
  TrendingUp,
  Orbit,
  Stars,
  Paperclip,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

const upcomingFeatures = [
  {
    number: '01',
    title: 'VIDEO AI',
    description: 'Explore next-generation AI video experiences.',
    icon: Video,
    status: 'COMING SOON',
  },
  {
    number: '02',
    title: 'CREATIVE EDITOR',
    description: 'A smarter workspace for creative projects.',
    icon: Scissors,
    status: 'IN DEVELOPMENT',
  },
  {
    number: '03',
    title: 'AI LEARNING',
    description: 'Discover artificial intelligence through learning.',
    icon: GraduationCap,
    status: 'COMING SOON',
  },
];

export default function HomeScreen() {
  return (
    <main className="min-h-screen bg-[#080510] p-10 text-white">
      <h1 className="text-3xl font-bold text-amber-300">
        AUREXA AI
      </h1>
      <p className="mt-4">Home page is working.</p>
    </main>
  );
}
  const router = useRouter();
  const t = useTranslations('home');
  const tp = useTranslations('pro');
  const locale = useLocale();

  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');

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

    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const routeToChat = (text: string, tool = 'chat') => {
    const value = text.trim();

    if (!value) {
      router.push(`/chat?tool=${encodeURIComponent(tool)}`);
      return;
    }

    router.push(
      `/chat?q=${encodeURIComponent(value)}&tool=${encodeURIComponent(tool)}`
    );
  };

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const capabilities = [
    'AI Chat & Assistant',
    'Smart Problem Solver',
    'Code with AI',
    'Chat History',
    'Image Generation',
    'Multilingual Experience',
  ];

  const quickTools = [
    {
      title: 'Chat',
      subtitle: 'Talk with AI',
      icon: MessageCircle,
      tool: 'chat',
    },
    {
      title: 'Solve',
      subtitle: 'Get solutions',
      icon: Calculator,
      tool: 'solve',
    },
    {
      title: 'Coding',
      subtitle: 'Write & debug',
      icon: Code2,
      tool: 'coding',
    },
    {
      title: 'Generate Image',
      subtitle: 'Turn ideas into art',
      icon: ImageIcon,
      tool: 'chat',
      prompt: 'Help me create an image based on my idea.',
    },
  ];

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[1600px] overflow-hidden px-4 pb-10 text-white sm:px-6 lg:px-8">

      {/* COSMIC BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05040b]">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_20%,rgba(91,35,160,0.23),transparent_48%)]" />

        <div className="absolute -left-40 top-40 h-[450px] w-[450px] rounded-full bg-violet-700/15 blur-[140px]" />

        <div className="absolute -right-40 top-[45%] h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[150px]" />

        <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] rounded-full bg-amber-500/[0.06] blur-[130px]" />

      </div>

      {/* TOP BAR */}

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-gradient-to-br from-amber-300/20 to-violet-500/20">
            <Orbit size={21} className="text-amber-300" />
          </div>

          <div>
            <p className="text-sm font-black tracking-[2px]">
              AUREXA <span className="text-amber-300">AI</span>
            </p>

            <p className="mt-1 text-[9px] tracking-[2px] text-white/40">
              IMAGINE · CREATE · INNOVATE
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-[10px] text-emerald-200">
              Online · Ready to help
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_25px_rgba(212,160,55,0.18)] transition hover:brightness-110"
          >
            <Crown size={14} />
            Upgrade
          </button>

        </div>

      </header>

      {/* HERO */}

      <section className="relative mb-10 mt-10 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">

        <div className="relative z-10">

          <div className="mb-5 flex items-center gap-2">

            <span className="h-px w-8 bg-amber-300" />

            <span className="text-[10px] font-bold tracking-[3px] text-amber-300">
              {getGreeting()}
            </span>

            <Stars size={13} className="text-violet-300" />

          </div>

          <h1 className="text-[42px] font-bold leading-[1.12] tracking-[-2px] sm:text-[62px]">

            Hello,{' '}
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {displayName}
            </span>

            <span className="ml-2 inline-block">👋</span>

          </h1>

          <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
            Welcome to{' '}
            <span className="text-amber-300">
              AUREXA AI
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
            Your intelligent AI companion, built for creativity,
            productivity and innovation.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-[10px] font-bold tracking-wider text-violet-200">
              ☿ MERCURY / PLATINUM
            </span>

            <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-4 py-2 text-[10px] font-bold tracking-wider text-amber-200">
              ♄ SATURN / GOLD
            </span>

          </div>

        </div>

        {/* PLANET VISUAL */}

        <div className="relative mx-auto flex h-[310px] w-full max-w-[470px] items-center justify-center sm:h-[390px]">

          <div className="absolute h-[250px] w-[250px] rounded-full bg-violet-600/20 blur-[90px]" />

          <div className="absolute h-[240px] w-[240px] rounded-full border border-violet-300/20 sm:h-[290px] sm:w-[290px]" />

          <div className="absolute h-[310px] w-[310px] rotate-[-20deg] rounded-full border border-amber-300/35 sm:h-[370px] sm:w-[370px]" />

          <div className="absolute h-[270px] w-[270px] rotate-[35deg] rounded-full border border-violet-400/20 sm:h-[330px] sm:w-[330px]" />

          <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border border-amber-200/50 bg-gradient-to-br from-[#fff0bd] via-[#8b68b5] to-[#171024] shadow-[0_0_70px_rgba(165,108,255,0.35),inset_0_0_40px_rgba(255,255,255,0.25)] sm:h-[220px] sm:w-[220px]">

            <div className="absolute inset-3 rounded-full border border-white/20" />

            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/50" />

            <div className="relative z-10 text-[90px] font-black text-amber-300 drop-shadow-[0_5px_20px_rgba(255,190,50,0.7)] sm:text-[115px]">
              A
            </div>

          </div>

          <div className="absolute right-[12%] top-[17%] h-3 w-3 rounded-full border border-amber-200 bg-amber-300 shadow-[0_0_18px_5px_rgba(255,190,50,0.5)]" />

          <div className="absolute bottom-[17%] left-[15%] h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_18px_5px_rgba(180,130,255,0.7)]" />

          <div className="absolute bottom-5 rounded-full border border-amber-300/20 bg-black/50 px-4 py-2 backdrop-blur-xl">
            <span className="text-[9px] font-bold tracking-[3px] text-amber-200">
              AUREXA CORE / 001
            </span>
          </div>

        </div>

      </section>

      {/* PROMPT BAR */}

      <section className="relative z-10 mb-8">

        <form
          onSubmit={handleSubmit}
          className="group relative overflow-hidden rounded-full border border-violet-300/30 bg-[#100c1c]/90 p-2 shadow-[0_0_35px_rgba(139,92,246,0.12)] backdrop-blur-xl transition focus-within:border-amber-300/60"
        >

          <div className="flex items-center gap-3">

            <Sparkles
              size={23}
              className="ml-3 shrink-0 text-amber-300"
            />

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('askPlaceholder')}
              rows={1}
              className="max-h-28 min-h-[48px] flex-1 resize-none border-0 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:ring-0"
            />

            <div className="hidden items-center gap-3 pr-2 sm:flex">

              <Paperclip size={19} className="text-white/55" />

              <ImageIcon size={19} className="text-white/55" />

            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              aria-label="Start chat"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-black shadow-[0_0_25px_rgba(245,190,60,0.35)] transition hover:scale-105 disabled:opacity-40"
            >
              <Send size={19} />
            </button>

          </div>

        </form>

        <p className="mt-3 text-center text-[9px] tracking-wider text-white/30">
          PRESS ENTER TO START · SHIFT + ENTER FOR NEW LINE
        </p>

      </section>

      {/* QUICK TOOLS */}

      <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">

        {quickTools.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() =>
                routeToChat(item.prompt || '', item.tool)
              }
              className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b1429]/95 to-[#0c0a15] p-4 text-left transition hover:border-amber-300/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.12)] sm:p-5"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/[0.08] text-amber-300 transition group-hover:bg-amber-300/15">
                <Icon size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {item.title}
                </p>

                <p className="mt-1 text-[10px] text-white/45">
                  {item.subtitle}
                </p>
              </div>

            </button>
          );
        })}

      </section>

      {/* FEATURES AND STATS */}

      <section className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr]">

        {/* FEATURES */}

        <div className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-[#191329] to-[#0c0a14] p-5 sm:p-6">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Sparkles size={20} className="text-amber-300" />

              <h2 className="text-base font-bold">
                Powerful Features
              </h2>

            </div>

            <span className="text-[10px] font-bold text-amber-300">
              EXPLORE →
            </span>

          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-4">

            {capabilities.map((feature) => (
              <div key={feature} className="flex items-center gap-2">

                <CheckCircle2
                  size={15}
                  className="shrink-0 text-amber-300"
                />

                <span className="text-[11px] text-white/75 sm:text-xs">
                  {feature}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* STATS */}

        <div className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#21172a] to-[#0c0a14] p-5 sm:p-6">

          <div className="mb-6 flex items-center gap-3">

            <TrendingUp size={20} className="text-amber-300" />

            <h2 className="text-base font-bold">
              AUREXA AI Stats
            </h2>

          </div>

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-4xl font-black text-amber-300">
                27+
              </p>

              <p className="mt-2 text-xs text-white/55">
                Free Chats
              </p>

            </div>

            <div className="h-14 w-px bg-white/15" />

            <div>

              <Infinity size={43} className="text-amber-300" />

              <p className="mt-2 text-xs text-white/55">
                Limitless Possibilities
              </p>

            </div>

            <div className="hidden items-end gap-1 sm:flex">

              {[18, 28, 40, 53].map((height, index) => (
                <div
                  key={index}
                  style={{ height: `${height}px` }}
                  className="w-3 rounded-t-sm bg-gradient-to-t from-amber-600 to-yellow-300"
                />
              ))}

            </div>

          </div>

        </div>

      </section>

      {/* STATUS */}

      <section className="mb-10 grid gap-3 sm:grid-cols-2">

        <div className="flex items-center gap-4 rounded-2xl border border-violet-300/15 bg-violet-500/[0.06] p-5">

          <Languages size={23} className="text-violet-300" />

          <div>
            <p className="text-sm font-bold">
              Multilingual AI
            </p>

            <p className="mt-1 text-[11px] text-white/45">
              Designed with Indian users in mind.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5">

          <Clock3 size={23} className="text-amber-300" />

          <div>
            <p className="text-sm font-bold">
              Early Launch Stage
            </p>

            <p className="mt-1 text-[11px] text-white/45">
              Features are being tested and improved.
            </p>
          </div>

        </div>

      </section>

      {/* UPCOMING */}

      <section className="mb-10">

        <div className="mb-5">

          <p className="text-[10px] font-bold tracking-[3px] text-amber-300">
            THE FUTURE
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Coming to AUREXA
          </h2>

        </div>

        <div className="grid gap-3 sm:grid-cols-3">

          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="rounded-2xl border border-white/10 bg-[#100d1a] p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                    <Icon size={19} />
                  </div>

                  <span className="text-[9px] text-white/35">
                    {feature.number}
                  </span>

                </div>

                <h3 className="mt-5 text-sm font-bold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/45">
                  {feature.description}
                </p>

                <p className="mt-4 border-t border-white/10 pt-4 text-[9px] font-bold tracking-[1.5px] text-amber-300">
                  {feature.status}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* PRO BANNER */}

      <section className="relative mb-10 overflow-hidden rounded-2xl border border-amber-300/25 bg-gradient-to-r from-[#281b36] via-[#171126] to-[#0c0a15] p-6 sm:p-8">

        <div className="absolute -right-10 -top-16 text-[190px] font-black text-amber-300/[0.04]">
          A
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-300">
              <Crown size={23} />
            </div>

            <div>

              <p className="text-[9px] font-bold tracking-[2px] text-amber-300">
                AUREXA / PRO
              </p>

              <h3 className="mt-2 text-lg font-bold">
                {tp('title')}
              </h3>

              <p className="mt-2 max-w-lg text-xs leading-6 text-white/50">
                {tp('desc')}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-300 to-yellow-600 px-6 py-3 text-xs font-black text-black transition hover:brightness-110"
          >
            {tp('cta')}
            <ArrowUpRight size={15} />
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">

        <div>
          <p className="text-[10px] font-black tracking-[2px] text-white/75">
            AUREXA AI
          </p>

          <p className="mt-1 text-[9px] text-white/35">
            Imagine · Create · Innovate
          </p>
        </div>

        <p className="text-[9px] text-white/35">
          © {new Date().getFullYear()} AUREXA AI. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
