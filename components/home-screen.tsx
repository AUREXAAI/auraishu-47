'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  Send,
  Code2,
  Image as ImageIcon,
  ChevronRight,
  Crown,
  MessageCircle,
  Bot,
  Lightbulb,
  Video,
  Scissors,
  GraduationCap,
  ArrowUpRight,
  Clock3,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type Feature = {
  key: string;
  icon: LucideIcon;
  tool?: string;
  accent: string;
};

const features: Feature[] = [
  {
    key: 'chat',
    icon: MessageCircle,
    tool: 'chat',
    accent: 'from-violet-500 to-purple-700',
  },
  {
    key: 'solve',
    icon: Lightbulb,
    tool: 'solve',
    accent: 'from-fuchsia-500 to-pink-600',
  },
  {
    key: 'coding',
    icon: Code2,
    tool: 'coding',
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'image',
    icon: ImageIcon,
    accent: 'from-pink-500 to-rose-600',
  },
  {
    key: 'video',
    icon: Video,
    accent: 'from-cyan-400 to-blue-600',
  },
  {
    key: 'editor',
    icon: Scissors,
    accent: 'from-orange-400 to-rose-500',
  },
  {
    key: 'courses',
    icon: GraduationCap,
    accent: 'from-emerald-400 to-teal-600',
  },
];

const chips = [
  { key: 'explain', icon: Lightbulb, tool: 'chat' },
  { key: 'writeCode', icon: Code2, tool: 'coding' },
  { key: 'createImage', icon: ImageIcon },
  { key: 'makeVideo', icon: Video },
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
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || t('username');

  function handleAsk() {
    if (!prompt.trim()) return;

    routeToChat(router, prompt);
  }

  function handleFeatureClick(feature: Feature) {
    if (feature.tool) {
      router.push(`/chat?tool=${encodeURIComponent(feature.tool)}`);
    }
  }

  function goToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const card = carousel.children[index] as HTMLElement | undefined;

    if (card) {
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }

    setActiveSlide(index);
  }

  function updateActiveSlide() {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(carousel.children) as HTMLElement[];

    if (!cards.length) return;

    const carouselLeft = carousel.getBoundingClientRect().left;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.getBoundingClientRect().left - carouselLeft,
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveSlide(nearestIndex);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090711] text-white">
      {/* Background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-36 top-24 h-80 w-80 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -right-36 top-80 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Top header */}
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="AUREXA AI home"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10 shadow-lg shadow-violet-950/40">
              <Sparkles className="h-5 w-5 text-violet-200" />
              <div className="absolute inset-0 rounded-2xl bg-violet-400/10 blur-lg" />
            </div>

            <div className="text-left">
              <p className="text-base font-bold tracking-[0.16em] text-white sm:text-lg">
                AUREXA<span className="text-violet-400"> AI</span>
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.23em] text-white/40">
                Intelligence, reimagined
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="flex shrink-0 items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3.5 py-2.5 text-xs font-semibold text-amber-200 transition hover:border-amber-200/40 hover:bg-amber-300/[0.13]"
          >
            <Crown className="h-4 w-4" />
            <span>PRO</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </button>
        </header>

        {/* Hero section */}
        <section className="relative mx-auto mt-7 max-w-3xl text-center sm:mt-10">
          {/* Animated orb */}
          <div className="relative mx-auto mb-1 flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
            <motion.div
              aria-hidden="true"
              className="absolute h-36 w-36 rounded-full bg-violet-600/25 blur-[45px] sm:h-48 sm:w-48"
              animate={{
                scale: [0.9, 1.15, 0.9],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              className="absolute h-32 w-32 rounded-full border border-violet-300/20 sm:h-40 sm:w-40"
              animate={{ rotate: 360 }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <motion.div
              className="absolute h-28 w-28 rounded-full border border-fuchsia-300/20 sm:h-36 sm:w-36"
              animate={{ rotate: -360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#b7a2ff] via-[#8050ed] to-[#35105f] shadow-[0_0_45px_rgba(139,92,246,0.45)] sm:h-32 sm:w-32"
              animate={{
                y: [0, -7, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="absolute inset-[7px] rounded-full border border-white/20 bg-gradient-to-br from-white/15 to-transparent" />

              <div className="absolute left-4 top-4 h-5 w-9 rounded-full bg-white/30 blur-md sm:left-6 sm:top-6 sm:h-6 sm:w-12" />

              <Sparkles className="relative z-10 h-10 w-10 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] sm:h-12 sm:w-12" />
            </motion.div>

            {/* Floating particles */}
            <motion.div
              aria-hidden="true"
              className="absolute left-5 top-10 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_14px_rgba(232,121,249,0.9)]"
              animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute right-5 top-16 h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_12px_rgba(196,181,253,0.9)]"
              animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute bottom-7 left-10 h-1.5 w-1.5 rounded-full bg-indigo-300"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute bottom-10 right-8 h-2 w-2 rounded-full bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-violet-200/90">
                Your AI workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t('greeting')}{' '}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50 sm:text-base">
              {t('sub')}
            </p>
          </motion.div>

          {/* Prompt box */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mx-auto mt-7 max-w-2xl"
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleAsk();
              }}
              className="group relative rounded-[24px] border border-white/[0.12] bg-[#15121f]/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.3)] transition duration-300 focus-within:border-violet-400/40 focus-within:shadow-[0_0_35px_rgba(139,92,246,0.1)]"
            >
              <div className="flex items-center gap-2 px-2 pt-2">
                <Sparkles className="h-5 w-5 shrink-0 text-violet-300" />

                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={t('askPlaceholder')}
                  aria-label={t('askPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
                />

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  aria-label="Send prompt"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40 transition hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/[0.07] px-2 pb-1 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
                  <span>Ready when you are</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-white/45">
                  <Zap className="h-3 w-3 text-violet-300" />
                  <span>AI powered</span>
                </div>
              </div>
            </form>

            {/* Prompt suggestions */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {chips.map((chip) => {
                const Icon = chip.icon;

                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      if (chip.tool) {
                        routeToChat(
                          router,
                          t(`chips.${chip.key}`),
                          chip.tool,
                        );
                      }
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-2.5 text-xs text-white/65 transition ${
                      chip.tool
                        ? 'hover:border-violet-300/30 hover:bg-violet-400/10 hover:text-white'
                        : 'cursor-default'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-violet-300" />
                    {t(`chips.${chip.key}`)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Features section */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-300 to-fuchsia-500" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                  Explore
                </p>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {t('explore')}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 pb-1 text-[10px] text-white/35 sm:text-xs">
              <span>Swipe to explore</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Horizontal feature carousel */}
          <div
            ref={carouselRef}
            onScroll={updateActiveSlide}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.button
                  key={feature.key}
                  type="button"
                  onClick={() => handleFeatureClick(feature)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.05, 0.25),
                  }}
                  className={`group relative min-h-[178px] w-[72%] max-w-[270px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#14111e] p-4 text-left transition duration-300 sm:min-h-[190px] sm:w-[31%] ${
                    feature.tool
                      ? 'hover:-translate-y-1 hover:border-violet-300/30 hover:bg-[#1b1628]'
                      : 'cursor-default'
                  }`}
                >
                  {/* Card glow */}
                  <div
                    aria-hidden="true"
                    className={`absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${feature.accent} opacity-[0.13] blur-3xl transition duration-300 group-hover:opacity-25`}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${feature.accent} shadow-lg`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition group-hover:border-violet-300/20 group-hover:text-violet-200">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        {tf(`${feature.key}.title`)}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45 sm:text-sm">
                        {tf(`${feature.key}.desc`)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-medium text-violet-300/75">
                      <span>{t('explore')}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Carousel indicators */}
          <div className="mt-1 flex items-center justify-center gap-1.5">
            {features.map((feature, index) => (
              <button
                key={feature.key}
                type="button"
                aria-label={`Go to feature ${index + 1}`}
                aria-current={activeSlide === index ? 'true' : undefined}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? 'w-6 bg-violet-400'
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Pro banner */}
        <section className="mt-9">
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="group relative w-full overflow-hidden rounded-[24px] border border-violet-300/20 bg-gradient-to-r from-[#21153a] via-[#20162f] to-[#171124] p-5 text-left transition hover:border-violet-300/35 sm:p-6"
          >
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-violet-500/15 blur-[65px]"
            />

            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-300/20 to-orange-500/10">
                <Crown className="h-6 w-6 text-amber-200" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                  AUREXA AI PRO
                </p>

                <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {tp('title')}
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">
                  {tp('desc')}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-200">
                  {tp('cta')}
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>

              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200" />
            </div>
          </button>
        </section>

        {/* Recent chat shortcut */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-violet-300" />
              <h2 className="text-sm font-semibold text-white">
                {t('recent')}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="flex items-center gap-1 text-xs text-violet-300 transition hover:text-violet-200"
            >
              {t('viewAll')}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-violet-300/20 hover:bg-white/[0.045]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08]">
              <Bot className="h-5 w-5 text-violet-300" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white/85">
                {t('recentNewChat')}
              </p>
              <p className="mt-1 truncate text-xs text-white/40">
                {t('recentChatDesc')}
              </p>
            </div>

            <span className="shrink-0 text-[10px] text-white/35">
              {t('recentTime')}
            </span>

            <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-white/[0.07] pt-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/45">
              AUREXA AI
            </span>
          </div>

          <p className="mt-2 text-[10px] text-white/25">
            Built for ideas. Designed for possibilities.
          </p>
        </footer>
      </div>
    </main>
  );
  }
