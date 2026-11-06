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
  Command,
  ArrowRight,
  Orbit,
  Stars,
  Moon,
  Cpu,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

const upcomingFeatures = [
  {
    number: '01',
    title: 'VIDEO / AI',
    description: 'Explore the next generation of AI video experiences.',
    icon: Video,
    status: 'COMING SOON',
    accent: 'gold',
  },
  {
    number: '02',
    title: 'CREATIVE / EDITOR',
    description: 'A smarter workspace for your creative projects.',
    icon: Scissors,
    status: 'IN DEVELOPMENT',
    accent: 'silver',
  },
  {
    number: '03',
    title: 'LEARN / AI',
    description: 'Discover artificial intelligence through learning.',
    icon: GraduationCap,
    status: 'COMING SOON',
    accent: 'violet',
  },
];

const tools = [
  {
    number: '01',
    title: 'AI CHAT',
    desc: 'Ask questions and explore new ideas.',
    icon: Sparkles,
    tool: 'chat',
  },
  {
    number: '02',
    title: 'AI SOLVER',
    desc: 'Understand problems step by step.',
    icon: Zap,
    tool: 'solve',
  },
  {
    number: '03',
    title: 'AI CODING',
    desc: 'Write, explain and improve code.',
    icon: Code2,
    tool: 'coding',
  },
];

export default function HomeScreen() {
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

  return (
    <main className="relative mx-auto w-full max-w-[1400px] overflow-hidden px-4 pb-12 text-white sm:px-7 lg:px-10">

      {/* COSMIC BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-700/[0.13] blur-[130px]" />

        <div className="absolute right-[-180px] top-[500px] h-[450px] w-[450px] rounded-full bg-amber-500/[0.07] blur-[130px]" />

        <div className="absolute bottom-0 left-[-150px] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.09] blur-[120px]" />

      </div>

      {/* TOP NAVIGATION */}

      <header className="relative z-10 mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.09] py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-gradient-to-br from-amber-200/20 to-violet-500/20 shadow-[0_0_25px_rgba(196,155,255,0.12)]">
            <Orbit size={21} className="text-amber-200" />
          </div>

          <div>
            <p className="text-sm font-black tracking-[3px]">
              AUREXA<span className="text-violet-400">.</span>
            </p>

            <p className="mt-1 text-[9px] tracking-[2px] text-white/35">
              INTELLIGENCE SYSTEM
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/[0.07] px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

            <span className="text-[9px] font-bold tracking-[1.5px] text-emerald-200">
              EARLY ACCESS
            </span>
          </div>

          <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] sm:flex">
            <Command size={15} className="text-amber-200/80" />
          </div>

        </div>

      </header>

      {/* HERO */}

      <section className="relative mb-16">

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

          {/* HERO TEXT */}

          <div className="relative z-10">

            <div className="mb-7 flex items-center gap-3">

              <span className="h-px w-10 bg-gradient-to-r from-amber-200 to-violet-400" />

              <span className="text-[10px] font-bold uppercase tracking-[3px] text-amber-200">
                {getGreeting()}
              </span>

              <Stars size={14} className="text-violet-300" />

            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.07] px-3 py-1.5">

              <Sparkles size={12} className="text-violet-300" />

              <span className="text-[9px] font-bold tracking-[2px] text-violet-200">
                MERCURY × SATURN EDITION
              </span>

            </div>

            <h1 className="text-[48px] font-black leading-[0.98] tracking-[-3px] sm:text-[72px] lg:text-[82px]">

              THINK
              <span className="text-violet-400">.</span>

              <br />

              <span className="bg-gradient-to-r from-white via-slate-300 to-amber-200 bg-clip-text text-transparent">
                CREATE.
              </span>

              <br />

              <span className="text-white/35">
                BUILD /
              </span>

            </h1>

            <div className="mt-8 flex items-center gap-4">

              <div className="h-12 w-[3px] rounded-full bg-gradient-to-b from-amber-200 via-violet-400 to-transparent" />

              <div>

                <p className="text-sm font-semibold text-white">
                  Welcome, {displayName}
                </p>

                <p className="mt-1 text-xs text-white/45">
                  What would you like to create today?
                </p>

              </div>

            </div>

            <p className="mt-7 max-w-lg text-sm leading-8 text-slate-300/55">
              Explore ideas, solve problems, write code and discover new
              possibilities with AUREXA AI. One intelligent workspace,
              multiple possibilities.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5">
                <span className="text-amber-200">☿</span>
                <span className="text-[9px] font-bold tracking-[1.5px] text-white/60">
                  MERCURY / SILVER
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5">
                <span className="text-amber-200">♄</span>
                <span className="text-[9px] font-bold tracking-[1.5px] text-white/60">
                  SATURN / GOLD
                </span>
              </div>

            </div>

          </div>

          {/* COSMIC VISUAL */}

          <div className="relative mx-auto w-full max-w-[530px]">

            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-[100px]" />

            <div
              className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/10 bg-[#090812] sm:min-h-[470px]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(5,5,14,.12), rgba(5,5,14,.88)), url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >

              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-amber-400/10" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 backdrop-blur-md">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                <span className="text-[9px] font-bold tracking-[2px] text-white/80">
                  AUREXA CORE
                </span>

              </div>

              {/* PLANET GRAPHIC */}

              <div className="absolute left-1/2 top-[43%] h-[185px] w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#e9ddca] via-[#9d91b4] to-[#302443] shadow-[0_0_80px_rgba(160,130,220,0.35)] sm:h-[220px] sm:w-[220px]">

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-black/60" />

                <div className="absolute left-[-35px] top-[42%] h-[55px] w-[255px] rotate-[-22deg] rounded-[50%] border-[8px] border-amber-200/50 shadow-[0_0_25px_rgba(231,196,132,0.25)] sm:left-[-45px] sm:w-[310px]" />

                <div className="absolute left-[-35px] top-[42%] h-[55px] w-[255px] rotate-[-22deg] rounded-[50%] border border-white/40 sm:left-[-45px] sm:w-[310px]" />

              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                <div className="mb-4 flex items-center gap-2">
                  <span className="h-px w-8 bg-amber-200" />

                  <span className="text-[9px] font-bold tracking-[3px] text-amber-200">
                    INTELLIGENCE REIMAGINED
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Beyond
                  <br />
                  <span className="bg-gradient-to-r from-violet-300 to-amber-200 bg-clip-text text-transparent">
                    Ordinary AI.
                  </span>
                </h2>

                <p className="mt-3 max-w-xs text-xs leading-6 text-white/55">
                  A new space for ideas, creativity and intelligent
                  possibilities.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">

                  <span className="text-[9px] font-bold tracking-[2px] text-white/45">
                    AUREXA AI / 001
                  </span>

                  <span className="flex items-center gap-2 text-[10px] font-semibold text-amber-200">
                    EXPLORE
                    <ArrowUpRight size={14} />
                  </span>

                </div>

              </div>

            </div>

            <div className="absolute -bottom-4 -right-3 hidden rounded-xl border border-amber-200/20 bg-[#11101a]/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:block">

              <div className="flex items-center gap-3">
                <Moon size={18} className="text-amber-200" />

                <div>
                  <p className="text-[9px] font-bold tracking-[1.5px] text-white">
                    COSMIC INTERFACE
                  </p>

                  <p className="mt-1 text-[9px] text-white/40">
                    Designed for possibilities
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* PROMPT CONSOLE */}

      <section className="relative mb-16">

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="text-[10px] font-bold tracking-[3px] text-amber-200">
              01 / START HERE
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              What&apos;s on your mind?
            </h2>

            <p className="mt-2 text-xs text-white/40">
              Your next idea starts here.
            </p>

          </div>

          <Sparkles size={23} className="text-violet-300" />

        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#171329] via-[#0e0d1a] to-[#17131b] p-4 shadow-[0_15px_60px_rgba(85,54,150,0.12)] transition-colors focus-within:border-amber-200/50 sm:p-7"
        >

          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-[60px]" />

          <div className="relative mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10">
                <Command size={13} className="text-violet-200" />
              </div>

              <span className="text-[9px] font-bold tracking-[2px] text-white/45">
                AUREXA / PROMPT CONSOLE
              </span>

            </div>

            <span className="text-[9px] tracking-widest text-amber-200/60">
              READY
            </span>

          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('askPlaceholder')}
            rows={3}
            className="relative w-full resize-none border-0 bg-transparent px-1 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:ring-0"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => setPrompt('Explain this topic step by step.')}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] text-white/65 transition hover:border-amber-200/40 hover:text-amber-200"
              >
                <Lightbulb size={13} />
                Explain
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Help me write and understand this code.')}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] text-white/65 transition hover:border-violet-300/40 hover:text-violet-200"
              >
                <Code2 size={13} />
                Code
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Help me solve this problem step by step.')}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] text-white/65 transition hover:border-amber-200/40 hover:text-amber-200"
              >
                <Zap size={13} />
                Solve
              </button>

            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3.5 text-[10px] font-black tracking-[1.5px] text-white shadow-[0_5px_25px_rgba(139,92,246,0.25)] transition hover:from-violet-500 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              START CHAT
              <Send size={14} />
            </button>

          </div>

        </form>

        <p className="mt-3 text-[9px] tracking-wide text-white/25">
          PRESS ENTER TO START · SHIFT + ENTER FOR NEW LINE
        </p>

      </section>

      {/* AI TOOLKIT */}

      <section className="mb-16">

        <div className="mb-7 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold tracking-[3px] text-amber-200">
              02 / CAPABILITIES
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Your AI toolkit
            </h2>

            <p className="mt-2 text-xs text-white/40">
              Powerful tools for your everyday ideas.
            </p>
          </div>

          <span className="hidden text-[9px] tracking-[2px] text-white/30 sm:block">
            EXPLORE WORKSPACE /
          </span>

        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          {tools.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.tool}
                type="button"
                onClick={() => routeToChat('', item.tool)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171329] to-[#0b0a14] p-6 text-left transition hover:border-violet-300/40 hover:shadow-[0_10px_40px_rgba(139,92,246,0.10)]"
              >

                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/[0.08] blur-2xl" />

                <div className="relative flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                    <Icon size={21} />
                  </div>

                  <span className="text-[10px] tracking-widest text-white/25">
                    / {item.number}
                  </span>

                </div>

                <h3 className="relative mt-7 text-sm font-black tracking-[1.5px]">
                  {item.title}
                </h3>

                <p className="relative mt-2 text-xs leading-6 text-white/45">
                  {item.desc}
                </p>

                <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">

                  <span className="text-[9px] font-bold tracking-[2px] text-amber-200">
                    OPEN TOOL
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-white/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-amber-200"
                  />

                </div>

              </button>
            );
          })}

        </div>

      </section>

      {/* STATUS CARDS */}

      <section className="mb-16 grid gap-4 sm:grid-cols-2">

        <div className="flex items-center gap-4 rounded-2xl border border-violet-300/15 bg-gradient-to-r from-violet-500/[0.09] to-transparent p-5 sm:p-6">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
            <Languages size={21} />
          </div>

          <div>
            <p className="text-sm font-bold">
              Multilingual AI
            </p>

            <p className="mt-1 text-[11px] text-white/45">
              Designed with Indian users in mind.
            </p>
          </div>

          <ArrowUpRight size={17} className="ml-auto text-violet-300/50" />

        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-200/15 bg-gradient-to-r from-amber-300/[0.07] to-transparent p-5 sm:p-6">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-200/10 text-amber-200">
            <Clock3 size={21} />
          </div>

          <div>
            <p className="text-sm font-bold">
              Early Launch Stage
            </p>

            <p className="mt-1 text-[11px] text-white/45">
              Features are being tested and improved.
            </p>
          </div>

          <ArrowUpRight size={17} className="ml-auto text-amber-200/50" />

        </div>

      </section>

      {/* UPCOMING FEATURES */}

      <section className="mb-16">

        <div className="mb-7">

          <p className="text-[10px] font-bold tracking-[3px] text-violet-300">
            03 / THE FUTURE
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            What&apos;s coming next?
          </h2>

          <p className="mt-2 text-xs text-white/40">
            More creative experiences are in development.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#100e1a] p-6 transition hover:border-amber-200/25"
              >

                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[0.08] blur-2xl" />

                <div className="relative flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-200/[0.07] text-amber-200">
                    <Icon size={19} />
                  </div>

                  <span className="text-[10px] tracking-widest text-white/25">
                    / {feature.number}
                  </span>

                </div>

                <h3 className="relative mt-7 text-sm font-black tracking-wide">
                  {feature.title}
                </h3>

                <p className="relative mt-3 min-h-[42px] text-xs leading-6 text-white/45">
                  {feature.description}
                </p>

                <div className="relative mt-5 border-t border-white/10 pt-4">

                  <span className="text-[9px] font-bold tracking-[1.5px] text-amber-200">
                    {feature.status}
                  </span>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* IMAGE + VOICE */}

      <section className="relative mb-12 overflow-hidden rounded-2xl border border-violet-300/20 bg-gradient-to-r from-[#1a1430] via-[#100e1c] to-[#17131a] p-6 sm:p-8">

        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/15 blur-[70px]" />

        <div className="relative flex flex-wrap items-center gap-5">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
            <ImageIcon size={24} />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[9px] font-bold tracking-[2px] text-amber-200">
              EXPANDING POSSIBILITIES
            </p>

            <h3 className="mt-2 text-lg font-bold">
              More ways to create.
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/45">
              Discover image generation and voice experiences in AUREXA AI.
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 text-[10px] text-white/55">
              <Mic size={17} className="text-violet-300" />
              VOICE
            </div>

            <div className="h-6 w-px bg-white/15" />

            <div className="flex items-center gap-2 text-[10px] text-white/55">
              <ImageIcon size={17} className="text-amber-200" />
              IMAGE
            </div>

          </div>

        </div>

      </section>

      {/* PRO SECTION */}

      <section className="relative mb-12 overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-br from-[#241a32] via-[#171126] to-[#0d0b17] p-6 shadow-[0_15px_60px_rgba(140,100,200,0.10)] sm:p-9">

        <div className="pointer-events-none absolute -right-12 -top-20 text-[230px] font-black leading-none text-amber-200/[0.045]">
          /
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-amber-300/10 blur-[70px]" />

        <div className="relative flex flex-wrap items-center justify-between gap-7">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200/25 bg-amber-200/10 text-amber-200">
              <Crown size={24} />
            </div>

            <div>

              <p className="text-[9px] font-bold tracking-[2px] text-amber-200">
                AUREXA / PRO
              </p>

              <h3 className="mt-2 text-xl font-bold">
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
            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-200 to-yellow-500 px-6 py-3.5 text-[10px] font-black tracking-[1.5px] text-[#17101d] transition hover:brightness-110"
          >
            {tp('cta')}
            <ArrowRight size={15} />
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-7">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200/20 bg-amber-200/[0.07]">
            <Orbit size={17} className="text-amber-200" />
          </div>

          <div>
            <p className="text-[10px] font-black tracking-[2px] text-white/75">
              AUREXA / AI
            </p>

            <p className="mt-1 text-[9px] text-white/30">
              Think. Create. Build.
            </p>
          </div>

        </div>

        <p className="text-[9px] tracking-wide text-white/30">
          © {new Date().getFullYear()} AUREXA AI. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
