'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import {
  Sparkles,
  Send,
  Code2,
  Image as ImageIcon,
  ChevronRight,
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type Feature = {
  key: string;
  icon: LucideIcon;
  tool?: string;
  accent: string;
  comingSoon?: boolean;
};

const features: Feature[] = [
  { key: 'chat', icon: MessageCircle, tool: 'chat', accent: 'from-amber-300 to-yellow-600' },
  { key: 'solve', icon: Lightbulb, tool: 'solve', accent: 'from-yellow-300 to-amber-600' },
  { key: 'coding', icon: Code2, tool: 'coding', accent: 'from-amber-400 to-orange-600' },
  { key: 'image', icon: ImageIcon, accent: 'from-yellow-300 to-amber-500', comingSoon: true },
  { key: 'video', icon: Video, accent: 'from-amber-300 to-yellow-600', comingSoon: true },
  { key: 'editor', icon: Scissors, accent: 'from-orange-300 to-amber-600', comingSoon: true },
  { key: 'courses', icon: GraduationCap, accent: 'from-yellow-400 to-amber-700', comingSoon: true },
];

const chips = [
  { key: 'explain', icon: Lightbulb, tool: 'chat' },
  { key: 'writeCode', icon: Code2, tool: 'coding' },
  { key: 'createImage', icon: ImageIcon, comingSoon: true },
  { key: 'makeVideo', icon: Video, comingSoon: true },
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [notice, setNotice] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

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

    const language = locale.split('-')[0].toLowerCase();

    return (greetings[language] || greetings.en)[index];
  }

  function handleAsk() {
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

  function handleChipClick(chip: (typeof chips)[number]) {
    if (chip.tool) {
      routeToChat(router, t(`chips.${chip.key}`), chip.tool);
      return;
    }

    setNotice(chip.key === 'createImage' ? 'image' : 'video');
  }

  function goToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const card = carousel.children[index] as HTMLElement | undefined;

    card?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });

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

  const noticeText =
    notice === 'image' || notice === 'createImage'
      ? 'AI Image Generation is coming soon.'
      : notice === 'video' || notice === 'makeVideo'
        ? 'AI Video Generation is coming soon.'
        : notice
          ? `${notice.charAt(0).toUpperCase()}${notice.slice(1)} is coming soon.`
          : '';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf9f5] text-[#241d14]">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#f2dcae]/40 blur-[110px]" />
        <div className="absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#e8c879]/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#f5e8ce]/50 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(190,145,65,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(190,145,65,0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">

        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="AUREXA AI home"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfc184]/60 bg-white/80 shadow-[0_8px_25px_rgba(171,128,48,0.15)] backdrop-blur-xl">
              <Sparkles className="h-5 w-5 text-[#bd8627]" />
            </div>

            <div className="text-left">
              <p className="text-base font-bold tracking-[0.16em] text-[#211b14] sm:text-lg">
                AUREXA<span className="text-[#bd8627]"> AI</span>
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.23em] text-[#98866b]">
                Imagine · Create · Innovate
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#d9b96e] bg-gradient-to-r from-[#f5dfa8] to-[#c79535] px-3.5 py-2.5 text-xs font-semibold text-[#4c3510] shadow-[0_6px_18px_rgba(181,132,39,0.2)] transition hover:brightness-105"
          >
            <Crown className="h-4 w-4" />
            <span>PRO</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </button>
        </header>

        {/* Hero */}
        <section className="relative mx-auto mt-7 max-w-3xl text-center sm:mt-10">
          <div className="relative mx-auto mb-1 flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">

            <motion.div
              aria-hidden="true"
              className="absolute h-36 w-36 rounded-full bg-[#e7c36e]/35 blur-[45px] sm:h-48 sm:w-48"
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
              aria-hidden="true"
              className="absolute h-32 w-32 rounded-full border border-[#c69b49]/40 sm:h-40 sm:w-40"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute h-28 w-28 rounded-full border border-[#e2c783]/60 sm:h-36 sm:w-36"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white bg-gradient-to-br from-white via-[#fff7e5] to-[#e9ca7d] shadow-[0_0_45px_rgba(190,145,48,0.35)] sm:h-32 sm:w-32"
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
              <div className="absolute inset-[7px] rounded-full border border-[#d4ae60]/40 bg-gradient-to-br from-white/80 to-transparent" />
              <Sparkles className="relative z-10 h-10 w-10 text-[#b98222] sm:h-12 sm:w-12" />
            </motion.div>

            <motion.div
              aria-hidden="true"
              className="absolute left-5 top-10 h-2 w-2 rounded-full bg-[#c99b3d]"
              animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute right-5 top-16 h-1.5 w-1.5 rounded-full bg-[#e0bd71]"
              animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4d2a9] bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#8a7040]">
                Your AI workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#211b14] sm:text-5xl">
              {getGreeting()}{' '}
              <span className="bg-gradient-to-r from-[#986514] via-[#d5ad55] to-[#a77722] bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#817565] sm:text-base">
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
              className="group relative rounded-[24px] border border-[#e6d6b5] bg-white/75 p-2 shadow-[0_15px_45px_rgba(143,105,43,0.12)] backdrop-blur-2xl transition focus-within:border-[#c49a48] focus-within:shadow-[0_15px_45px_rgba(143,105,43,0.18)]"
            >
              <div className="flex items-center gap-2 px-2 pt-2">
                <Sparkles className="h-5 w-5 shrink-0 text-[#bd8627]" />

                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={t('askPlaceholder')}
                  aria-label={t('askPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#241d14] outline-none placeholder:text-[#a99b84] sm:text-base"
                />

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  aria-label="Send prompt"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8c875] to-[#bd8627] text-white shadow-lg shadow-[#b98222]/20 transition hover:scale-[1.04] disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#eee4d1] px-2 pb-1 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#94866f]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Ready when you are</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-[#f8f1e4] px-2 py-1 text-[10px] text-[#92733c]">
                  <Zap className="h-3 w-3 text-[#bd8627]" />
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
                    onClick={() => handleChipClick(chip)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-[#e8dcc5] bg-white/65 px-3.5 py-2.5 text-xs text-[#76664c] shadow-sm backdrop-blur-xl transition hover:border-[#cda34d] hover:bg-[#fff8e9] hover:text-[#805b19]"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#bd8627]" />
                    {t(`chips.${chip.key}`)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Early Access Stats */}
        <section className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-[#d9bd7e]/60 bg-white/65 p-5 text-center shadow-[0_12px_35px_rgba(150,112,43,0.10)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e8c879]/30 blur-3xl" />

            <p className="relative bg-gradient-to-r from-[#9c6b18] via-[#d5ad55] to-[#a77722] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              13K+
            </p>

            <p className="relative mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#80683e] sm:text-xs">
              Early Access Trials
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative overflow-hidden rounded-3xl border border-[#d9bd7e]/60 bg-white/65 p-5 text-center shadow-[0_12px_35px_rgba(150,112,43,0.10)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-[#e8c879]/30 blur-3xl" />

            <p className="relative text-2xl font-extrabold text-[#b78a36] sm:text-3xl">
              EARLY
            </p>

            <p className="relative mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#80683e] sm:text-xs">
              Testing Stage
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#f0d48f] to-[#bd8627]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a17a35]">
                  Explore
                </p>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-[#241d14] sm:text-2xl">
                {t('explore')}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 pb-1 text-[10px] text-[#a39782] sm:text-xs">
              <span>Swipe to explore</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

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
                  className={`group relative min-h-[178px] w-[72%] max-w-[270px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-[#e7d9bd] bg-white/65 p-4 text-left shadow-[0_12px_32px_rgba(129,94,35,0.08)] backdrop-blur-2xl transition duration-300 sm:min-h-[190px] sm:w-[31%] ${
                    feature.tool
                      ? 'hover:-translate-y-1 hover:border-[#cda34d] hover:bg-white/90'
                      : 'hover:border-[#d7c08f]'
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${feature.accent} opacity-[0.16] blur-3xl transition group-hover:opacity-30`}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br ${feature.accent} shadow-lg shadow-[#bd8627]/15`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      {feature.comingSoon ? (
                        <span className="rounded-full border border-[#e8d8b6] bg-[#fbf5e9] px-2 py-1 text-[9px] text-[#9a7c45]">
                          Soon
                        </span>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8dcc5] bg-white/70 text-[#a58a58] transition group-hover:text-[#966718]">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-[#292116] sm:text-base">
                        {tf(`${feature.key}.title`)}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8c806c] sm:text-sm">
                        {tf(`${feature.key}.desc`)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-medium text-[#a47b32]">
                      <span>
                        {feature.comingSoon ? 'Coming Soon' : t('explore')}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

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
                    ? 'w-6 bg-[#bd8627]'
                    : 'w-1.5 bg-[#dfd2b9] hover:bg-[#c5a45f]'
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
            className="group relative w-full overflow-hidden rounded-[24px] border border-[#ddc28a] bg-gradient-to-r from-[#fffaf0] via-[#f8edcf] to-[#f1dfb5] p-5 text-left shadow-[0_12px_35px_rgba(156,113,35,0.12)] transition hover:border-[#c49a48] sm:p-6"
          >
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-[#dfbd70]/25 blur-[65px]"
            />

            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e2c783] bg-gradient-to-br from-[#f7df9f] to-[#bd8627] shadow-md">
                <Crown className="h-6 w-6 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a47a2e]">
                  AUREXA AI PRO
                </p>

                <h3 className="mt-1 text-base font-semibold text-[#342613] sm:text-lg">
                  {tp('title')}
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#897653] sm:text-sm">
                  {tp('desc')}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#986b1d]">
                  {tp('cta')}
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>

              <ArrowUpRight className="h-5 w-5 shrink-0 text-[#a17b3b] transition group-hover:text-[#805514]" />
            </div>
          </button>
        </section>

        {/* Recent chat shortcut */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#bd8627]" />
              <h2 className="text-sm font-semibold text-[#302619]">
                {t('recent')}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="flex items-center gap-1 text-xs text-[#a47b32] transition hover:text-[#805514]"
            >
              {t('viewAll')}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#e8dcc5] bg-white/65 p-4 text-left shadow-sm backdrop-blur-xl transition hover:border-[#cda34d] hover:bg-white/90"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ead9b4] bg-[#fbf3e3]">
              <MessageCircle className="h-5 w-5 text-[#bd8627]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#342b1e]">
                {t('recentNewChat')}
              </p>
              <p className="mt-1 truncate text-xs text-[#978a75]">
                {t('recentChatDesc')}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#b29a6d] transition group-hover:translate-x-0.5 group-hover:text-[#986b1d]" />
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#e8dcc5] pt-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#bd8627]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#9b896b]">
              AUREXA AI
            </span>
          </div>

          <p className="mt-2 text-[10px] text-[#a69a86]">
            Built for ideas. Designed for possibilities.
          </p>
        </footer>
      </div>

      {/* Coming soon notification */}
      {notice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b2d17]/25 p-5 backdrop-blur-md"
          onClick={() => setNotice('')}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            className="w-full max-w-sm rounded-3xl border border-[#e4d1a6] bg-white/90 p-6 shadow-2xl shadow-[#8f6a2c]/20 backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ead7ad] bg-[#fbf3e3]">
                <Sparkles className="h-6 w-6 text-[#bd8627]" />
              </div>

              <button
                type="button"
                aria-label="Close notification"
                onClick={() => setNotice('')}
                className="rounded-xl p-2 text-[#98866b] transition hover:bg-[#f7efdf] hover:text-[#604719]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2
              id="coming-soon-title"
              className="mt-5 text-xl font-semibold text-[#302619]"
            >
              Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#84745c]">
              {noticeText} We are working to bring more creative tools to
              AUREXA AI.
            </p>

            <button
              type="button"
              onClick={() => setNotice('')}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#e8c875] to-[#bd8627] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#bd8627]/20 transition hover:brightness-105"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
