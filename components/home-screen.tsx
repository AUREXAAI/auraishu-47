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
  Plus,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

const upcomingFeatures = [
  {
    number: '01',
    title: 'VIDEO / AI',
    description: 'Explore the next generation of AI video experiences.',
    icon: Video,
    status: 'COMING SOON',
  },
  {
    number: '02',
    title: 'CREATIVE / EDITOR',
    description: 'A smarter workspace for your creative projects.',
    icon: Scissors,
    status: 'IN DEVELOPMENT',
  },
  {
    number: '03',
    title: 'LEARN / AI',
    description: 'Discover artificial intelligence through learning.',
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

    if (!value) return;

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
    <main className="relative mx-auto w-full max-w-[1250px] overflow-hidden pb-10 text-white">

      {/* TOP BAR */}

      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">

        <div>
          <p className="text-[11px] font-bold tracking-[3px] text-violet-400">
            AUREXA <span className="text-white/40">/</span> INTELLIGENCE
          </p>

          <p className="mt-2 text-[11px] tracking-wide text-white/40">
            YOUR PERSONAL AI WORKSPACE
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

            <span className="text-[9px] font-bold tracking-[1.5px] text-violet-200">
              EARLY ACCESS
            </span>
          </div>

          <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] sm:flex">
            <Command size={15} className="text-white/60" />
          </div>

        </div>
      </header>

      {/* HERO SECTION */}

      <section className="relative mb-14">

        {/* Decorative slash */}

        <div className="pointer-events-none absolute -right-10 -top-10 hidden h-[350px] w-[180px] -skew-x-[25deg] border-l border-violet-500/10 bg-violet-500/[0.025] lg:block" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          <div>

            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-violet-400" />

              <span className="text-[10px] font-bold uppercase tracking-[3px] text-violet-300">
                {getGreeting()}
              </span>
            </div>

            <h1 className="max-w-[700px] text-[42px] font-semibold leading-[1.08] tracking-[-2px] sm:text-[64px] sm:tracking-[-3px]">

              THINK
              <span className="text-violet-400">.</span>

              <br />

              CREATE
              <span className="text-violet-400">.</span>

              <br />

              <span className="text-white/40">
                BUILD /
              </span>

            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-3">

              <div className="h-8 w-1 bg-violet-500" />

              <div>
                <p className="text-sm font-semibold text-white">
                  Welcome, {displayName}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  What would you like to create today?
                </p>
              </div>

            </div>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/45">
              Explore ideas, solve problems, write code and discover new
              possibilities with AUREXA AI.
            </p>

          </div>

          {/* RIGHT HERO PANEL */}

          <div className="relative">

            <div className="absolute -right-2 -top-3 text-[90px] font-black leading-none text-violet-500/[0.06] sm:text-[130px]">
              /
            </div>

            <div className="relative overflow-hidden border border-violet-400/20 bg-[#100d1c] p-6 sm:p-8">

              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 rotate-45 bg-violet-500/20" />

              <div className="flex items-center justify-between border-b border-white/10 pb-5">

                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-400" />

                  <span className="text-[10px] font-bold tracking-[2px] text-white/70">
                    AUREXA / CORE
                  </span>
                </div>

                <span className="text-[9px] tracking-widest text-violet-300">
                  SYSTEM 01
                </span>

              </div>

              <div className="py-10">

                <p className="text-[10px] font-bold tracking-[3px] text-white/35">
                  INTELLIGENCE
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Beyond
                  <br />
                  <span className="text-violet-400">Ordinary AI.</span>
                </h2>

                <p className="mt-4 max-w-xs text-xs leading-6 text-white/40">
                  One workspace. Multiple possibilities. Built to help you
                  think and create.
                </p>

              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-5">

                <span className="text-[9px] font-bold tracking-[2px] text-white/40">
                  AUREXA AI
                </span>

                <span className="flex items-center gap-2 text-[10px] text-violet-300">
                  Explore workspace
                  <ArrowUpRight size={13} />
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* PROMPT CONSOLE */}

      <section className="relative mb-14">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-[10px] font-bold tracking-[3px] text-violet-400">
              01 / START HERE
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              What&apos;s on your mind?
            </h2>
          </div>

          <Sparkles size={20} className="text-violet-400" />

        </div>

        <form
          onSubmit={handleSubmit}
          className="relative border border-violet-400/25 bg-[#100d1c] p-4 transition-colors focus-within:border-violet-400/60 sm:p-6"
        >

          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

            <span className="text-[9px] font-bold tracking-[2px] text-white/40">
              AUREXA / PROMPT CONSOLE
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('askPlaceholder')}
            rows={3}
            className="w-full resize-none border-0 bg-transparent px-1 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:ring-0"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-4">

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => setPrompt('Explain this topic step by step.')}
                className="flex items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] text-white/65 transition hover:border-violet-400/40 hover:text-violet-300"
              >
                <Lightbulb size={13} />
                Explain
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Help me write and understand this code.')}
                className="flex items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] text-white/65 transition hover:border-violet-400/40 hover:text-violet-300"
              >
                <Code2 size={13} />
                Code
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Help me solve this problem step by step.')}
                className="flex items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] text-white/65 transition hover:border-violet-400/40 hover:text-violet-300"
              >
                <Zap size={13} />
                Solve
              </button>

            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center gap-3 bg-violet-600 px-5 py-3 text-[10px] font-bold tracking-[1px] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* TOOLS */}

      <section className="mb-14">

        <div className="mb-6 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold tracking-[3px] text-violet-400">
              02 / CAPABILITIES
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Your AI toolkit
            </h2>
          </div>

          <span className="text-[9px] tracking-widest text-white/30">
            EXPLORE
          </span>

        </div>

        <div className="grid gap-3 sm:grid-cols-3">

          {[
            {
              number: '01',
              title: 'AI CHAT',
              desc: 'Ask questions and explore ideas.',
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
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.tool}
                type="button"
                onClick={() => routeToChat('', item.tool)}
                className="group relative overflow-hidden border border-white/10 bg-[#100d1c] p-5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/[0.06] sm:p-6"
              >

                <div className="absolute -right-2 -top-5 text-6xl font-black text-violet-500/[0.06]">
                  /
                </div>

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <Icon size={19} />
                  </div>

                  <span className="text-[10px] tracking-widest text-white/25">
                    {item.number}
                  </span>

                </div>

                <h3 className="mt-6 text-sm font-bold tracking-[1px]">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/40">
                  {item.desc}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">

                  <span className="text-[9px] font-bold tracking-[2px] text-violet-300">
                    OPEN TOOL
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="text-white/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-300"
                  />

                </div>

              </button>
            );
          })}

        </div>
      </section>

      {/* STATUS */}

      <section className="mb-14 grid gap-3 sm:grid-cols-2">

        <div className="flex items-center gap-4 border border-white/10 bg-[#100d1c] p-5">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-violet-500/10 text-violet-300">
            <Languages size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Multilingual AI
            </p>

            <p className="mt-1 text-[11px] text-white/40">
              Designed with Indian users in mind.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4 border border-white/10 bg-[#100d1c] p-5">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-violet-500/10 text-violet-300">
            <Clock3 size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Early Launch Stage
            </p>

            <p className="mt-1 text-[11px] text-white/40">
              Features are being tested and improved.
            </p>
          </div>

        </div>

      </section>

      {/* UPCOMING FEATURES */}

      <section className="mb-14">

        <div className="mb-6">

          <p className="text-[10px] font-bold tracking-[3px] text-violet-400">
            03 / THE FUTURE
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            What&apos;s coming next?
          </h2>

          <p className="mt-2 text-xs text-white/40">
            New experiences currently in development.
          </p>

        </div>

        <div className="grid gap-3 sm:grid-cols-3">

          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="relative border border-white/10 bg-[#100d1c] p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <Icon size={18} />
                  </div>

                  <span className="text-[9px] text-white/25">
                    / {feature.number}
                  </span>

                </div>

                <h3 className="mt-6 text-sm font-bold tracking-wide">
                  {feature.title}
                </h3>

                <p className="mt-2 min-h-[42px] text-xs leading-6 text-white/40">
                  {feature.description}
                </p>

                <div className="mt-5 border-t border-white/[0.08] pt-4">

                  <span className="text-[9px] font-bold tracking-[1.5px] text-violet-300">
                    {feature.status}
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* IMAGE + VOICE */}

      <section className="mb-10 border border-violet-400/20 bg-[#100d1c] p-5 sm:p-7">

        <div className="flex flex-wrap items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-violet-500/10 text-violet-300">
            <ImageIcon size={22} />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[9px] font-bold tracking-[2px] text-violet-300">
              EXPANDING POSSIBILITIES
            </p>

            <h3 className="mt-2 text-sm font-semibold">
              More ways to create.
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/40">
              Explore image generation and voice experiences in AUREXA AI.
            </p>

          </div>

          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <Mic size={15} className="text-violet-300" />
            <span>AI EXPERIENCES</span>
          </div>

        </div>

      </section>

      {/* PRO SECTION */}

      <section className="relative overflow-hidden border border-violet-400/25 bg-[#171126] p-6 sm:p-8">

        <div className="absolute -right-10 -top-10 text-[180px] font-black leading-none text-violet-500/[0.06]">
          /
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-violet-500/15 text-violet-300">
              <Crown size={22} />
            </div>

            <div>

              <p className="text-[9px] font-bold tracking-[2px] text-violet-300">
                AUREXA / PRO
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {tp('title')}
              </h3>

              <p className="mt-2 max-w-lg text-xs leading-6 text-white/45">
                {tp('desc')}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-3 bg-violet-600 px-5 py-3 text-[10px] font-bold tracking-[1px] transition hover:bg-violet-500"
          >
            {tp('cta')}
            <ArrowRight size={14} />
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">

        <div>
          <p className="text-[10px] font-bold tracking-[2px] text-white/60">
            AUREXA / AI
          </p>

          <p className="mt-2 text-[9px] text-white/30">
            Think. Create. Build.
          </p>
        </div>

        <p className="text-[9px] text-white/30">
          © {new Date().getFullYear()} AUREXA AI. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
