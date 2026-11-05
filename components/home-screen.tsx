'use client';

import { useState, type FormEvent } from 'react';
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
  ArrowRight,
  Crown,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

const upcomingFeatures = [
  {
    title: 'Video AI',
    description: 'Create and explore AI-powered video experiences.',
    icon: Video,
    status: 'COMING SOON',
  },
  {
    title: 'AI Editor',
    description: 'An intelligent workspace for creative projects.',
    icon: Scissors,
    status: 'IN DEVELOPMENT',
  },
  {
    title: 'AI Courses',
    description: 'Learn artificial intelligence step by step.',
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

  return (
    <div className="mx-auto w-full max-w-[1200px]">

      {/* PAGE HEADER */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#8179a6]">
            AUREXA AI / HOME
          </p>

          <p className="mt-1 text-[11px] text-[#aaa2c8]">
            Your intelligent workspace
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#302852] bg-[#12102a] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-violet-400" />

          <span className="text-[10px] font-medium text-violet-200">
            Early Launch Stage
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-[850px] py-5 text-center">

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2">
          <Sparkles size={14} className="text-violet-300" />

          <span className="text-[10px] font-bold uppercase tracking-[2px] text-violet-200">
            Your AI Workspace
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#f4f0ff] sm:text-5xl">
          {getGreeting()},{' '}
          <span className="text-gradient">
            {displayName}
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#aaa2c8] sm:text-base">
          What would you like to explore today?
          <br className="hidden sm:block" />
          Ask, create, learn and build with AUREXA AI.
        </p>

        {/* PROMPT BOX */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-[#393052] bg-[#12102a] p-3 text-left shadow-[0_15px_45px_rgba(0,0,0,0.18)] sm:p-5"
        >
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                routeToChat(prompt);
              }
            }}
            placeholder={t('askPlaceholder')}
            rows={3}
            className="w-full resize-none border-0 bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#77718f] focus:ring-0"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#302852] pt-4">

            {/* QUICK PROMPTS */}
            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  setPrompt('Explain this topic step by step.')
                }
                className="rounded-lg border border-[#393052] bg-[#171432] px-3 py-2 text-[11px] font-medium text-[#c7b9ee] hover:border-violet-500/50"
              >
                <Lightbulb className="mr-1 inline" size={13} />
                Explain
              </button>

              <button
                type="button"
                onClick={() =>
                  setPrompt('Help me write and understand this code.')
                }
                className="rounded-lg border border-[#393052] bg-[#171432] px-3 py-2 text-[11px] font-medium text-[#c7b9ee] hover:border-violet-500/50"
              >
                <Code2 className="mr-1 inline" size={13} />
                Write Code
              </button>

              <button
                type="button"
                onClick={() =>
                  setPrompt('Help me solve this problem step by step.')
                }
                className="rounded-lg border border-[#393052] bg-[#171432] px-3 py-2 text-[11px] font-medium text-[#c7b9ee] hover:border-violet-500/50"
              >
                <Zap className="mr-1 inline" size={13} />
                Solve
              </button>

            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start Chat
              <Send size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* STATUS CARDS */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2">

        <div className="flex items-center gap-4 rounded-2xl border border-[#302852] bg-[#12102a] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <Sparkles size={22} />
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              Multilingual AI
            </p>

            <p className="mt-1 text-xs text-[#aaa2c8]">
              Built with Indian users in mind.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#302852] bg-[#12102a] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
            <Clock3 size={22} />
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              Early Launch
            </p>

            <p className="mt-1 text-xs text-[#aaa2c8]">
              Features are being tested and improved.
            </p>
          </div>
        </div>

      </section>

      {/* UPCOMING FEATURES */}
      <section className="mt-14">

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-violet-300">
              What's Next
            </p>

            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Explore what's coming
            </h2>

            <p className="mt-2 text-xs text-[#aaa2c8]">
              New experiences currently in development.
            </p>
          </div>

          <span className="text-[10px] text-[#8179a6]">
            Upcoming features
          </span>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">

          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="w-[260px] shrink-0 snap-start rounded-2xl border border-[#302852] bg-[#12102a] p-5 sm:w-[290px]"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Icon size={21} />
                  </div>

                  <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[8px] font-bold tracking-wide text-violet-300">
                    {feature.status}
                  </span>

                </div>

                <h3 className="mt-5 text-base font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 min-h-[42px] text-xs leading-5 text-[#aaa2c8]">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-violet-300">
                  In Development
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* FUTURE TOOLS */}
      <section className="mt-5 rounded-2xl border border-[#393052] bg-gradient-to-r from-[#171432] to-[#12102a] p-5 sm:p-7">

        <div className="flex flex-wrap items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <ImageIcon size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white">
              More AI experiences are on the way
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#aaa2c8]">
              Image Generation and Live Voice Mode are planned for upcoming releases.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
            <Mic size={15} />
            <span>Coming Soon</span>
          </div>

        </div>
      </section>

      {/* PRO BANNER */}
      <section className="mt-8 rounded-2xl border border-violet-500/25 bg-gradient-to-r from-[#211943] to-[#171432] p-6 sm:flex sm:items-center sm:justify-between sm:p-8">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <Crown size={23} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              {tp('title')}
            </h3>

            <p className="mt-2 max-w-lg text-xs leading-6 text-[#aaa2c8]">
              {tp('desc')}
            </p>
          </div>

        </div>

        <button
          onClick={() => router.push('/pricing')}
          className="mt-5 flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-500 sm:mt-0"
        >
          {tp('cta')}
          <ArrowRight size={14} />
        </button>

      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[#302852] py-7 text-center">
        <p className="text-[10px] tracking-wide text-[#8179a6]">
          © {new Date().getFullYear()} AUREXA AI. All rights reserved.
        </p>

        <p className="mt-2 text-[10px] text-[#77718f]">
          Built for a more accessible AI experience.
        </p>
      </footer>

    </div>
  );
}
