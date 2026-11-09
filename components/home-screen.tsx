'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import {
Sparkles,
Send,
Code2,
Clock3,
Video,
Scissors,
GraduationCap,
ArrowUpRight,
Crown,
Image as ImageIcon,
Languages,
MessageCircle,
Calculator,
CheckCircle2,
TrendingUp,
Orbit,
Stars,
Paperclip,
ArrowRight,
Command,
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
title: 'AI Chat',
subtitle: 'Talk with intelligence',
icon: MessageCircle,
tool: 'chat',
},
{
title: 'AI Solver',
subtitle: 'Solve your problems',
icon: Calculator,
tool: 'solve',
},
{
title: 'AI Coding',
subtitle: 'Write & debug code',
icon: Code2,
tool: 'coding',
},
{
title: 'AI Images',
subtitle: 'Turn ideas into art',
icon: ImageIcon,
tool: 'chat',
prompt: 'Help me create an image based on my idea.',
},
];

return (
<main className="relative mx-auto min-h-screen w-full max-w-[1600px] overflow-hidden px-4 pb-12 text-[#effaf3] sm:px-6 lg:px-10">

  {/* EMERALD PRESTIGE BACKGROUND */}
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030d09]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(5,150,105,0.22),transparent_55%)]" />

    <div className="absolute -left-40 top-40 h-[450px] w-[450px] rounded-full bg-[#047857]/20 blur-[150px]" />

    <div className="absolute -right-40 top-[35%] h-[500px] w-[500px] rounded-full bg-[#10b981]/10 blur-[160px]" />

    <div className="absolute bottom-0 left-1/3 h-[350px] w-[500px] rounded-full bg-[#d4af37]/[0.07] blur-[150px]" />

    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.025)_1px,transparent_1px)] bg-[size:55px_55px]" />
  </div>

  {/* HEADER */}
  <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#d4af37]/15 py-5">

    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#047857]/50 to-[#022c22]/80 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <Orbit size={22} className="text-[#e6c76a]" />
      </div>

      <div>
        <p className="text-sm font-black tracking-[3px] text-[#f0fdf4]">
          AUREXA <span className="text-[#d4af37]">AI</span>
        </p>

        <p className="mt-1 text-[9px] tracking-[2.5px] text-[#8ab8a0]/60">
          INTELLIGENCE REIMAGINED
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

        <span className="text-[10px] text-emerald-200">
          Online · Ready
        </span>
      </div>

      <button
        type="button"
        onClick={() => router.push('/pricing')}
        className="flex items-center gap-2 rounded-full border border-[#d4af37]/50 bg-gradient-to-r from-[#e8ce79] to-[#b99537] px-4 py-2.5 text-xs font-bold text-[#14251a] shadow-[0_5px_25px_rgba(212,175,55,0.15)] transition hover:brightness-110"
      >
        <Crown size={14} />
        Upgrade
      </button>
    </div>
  </header>

  {/* HERO */}
  <section className="relative mb-12 mt-12 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">

    <div className="relative z-10">

      <div className="mb-6 flex items-center gap-3">
        <span className="h-px w-9 bg-[#d4af37]" />

        <span className="text-[10px] font-bold tracking-[3px] text-[#dfc56e]">
          {getGreeting()}
        </span>

        <Stars size={14} className="text-[#d4af37]" />
      </div>

      <h1 className="text-[42px] font-semibold leading-[1.12] tracking-[-2px] sm:text-[65px]">
        Hello,

        <br />

        <span className="bg-gradient-to-r from-[#f0fdf4] via-[#86efac] to-[#d4af37] bg-clip-text text-transparent">
          {displayName}
        </span>

        <span className="ml-2 inline-block text-[#d4af37]">✦</span>
      </h1>

      <h2 className="mt-6 text-2xl font-medium tracking-tight text-[#ecfdf5] sm:text-3xl">
        Intelligence,

        <br />

        <span className="font-semibold text-[#34d399]">
          reimagined.
        </span>
      </h2>

      <p className="mt-5 max-w-lg text-sm leading-8 text-[#a7c5b3]/70 sm:text-base">
        Welcome to AUREXA AI. Your intelligent companion for
        creativity, productivity, problem solving and innovation.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() => routeToChat('', 'chat')}
          className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f0d989] px-6 py-3.5 text-xs font-bold text-[#14251a] shadow-[0_8px_30px_rgba(212,175,55,0.18)] transition hover:scale-[1.03]"
        >
          Start Exploring
          <ArrowRight size={15} />
        </button>

        <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3 text-[10px] font-semibold tracking-wider text-emerald-200">
          <Sparkles size={14} />
          AI POWERED
        </span>

      </div>
    </div>

    {/* EMERALD AI ORB */}
    <div className="relative mx-auto flex h-[320px] w-full max-w-[470px] items-center justify-center sm:h-[410px]">

      <div className="absolute h-[260px] w-[260px] rounded-full bg-emerald-500/20 blur-[100px]" />

      <div className="absolute h-[240px] w-[240px] rounded-full border border-emerald-300/20 sm:h-[300px] sm:w-[300px]" />

      <div className="absolute h-[300px] w-[300px] rotate-[-25deg] rounded-full border border-[#d4af37]/40 sm:h-[370px] sm:w-[370px]" />

      <div className="absolute h-[270px] w-[270px] rotate-[35deg] rounded-full border border-emerald-400/30 sm:h-[330px] sm:w-[330px]" />

      <div className="absolute h-[200px] w-[200px] rounded-full border border-[#d4af37]/15 sm:h-[250px] sm:w-[250px]" />

      <div className="relative flex h-[175px] w-[175px] items-center justify-center rounded-full border border-[#e6d28a]/60 bg-gradient-to-br from-[#bbf7d0] via-[#047857] to-[#022c22] shadow-[0_0_90px_rgba(16,185,129,0.35),inset_0_0_45px_rgba(255,255,255,0.18)] sm:h-[215px] sm:w-[215px]">

        <div className="absolute inset-3 rounded-full border border-white/20" />

        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-transparent to-black/60" />

        <span className="relative z-10 bg-gradient-to-b from-[#fffef0] via-[#e6d28a] to-[#b99537] bg-clip-text text-[100px] font-black text-transparent drop-shadow-[0_8px_25px_rgba(0,0,0,0.3)] sm:text-[125px]">
          A
        </span>

      </div>

      <div className="absolute right-[12%] top-[17%] h-3 w-3 rounded-full border border-[#f4e4a9] bg-[#d4af37] shadow-[0_0_20px_5px_rgba(212,175,55,0.4)]" />

      <div className="absolute bottom-[17%] left-[15%] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_20px_5px_rgba(52,211,153,0.5)]" />

      <div className="absolute bottom-3 rounded-full border border-[#d4af37]/25 bg-[#04150e]/85 px-5 py-2.5 backdrop-blur-xl">
        <span className="text-[9px] font-bold tracking-[3px] text-[#e6d28a]">
          AUREXA CORE · 001
        </span>
      </div>

    </div>
  </section>

  {/* AI PROMPT */}
  <section className="relative z-10 mb-9">

    <div className="mb-4 flex items-center justify-between px-1">
      <div>
        <p className="text-[10px] font-bold tracking-[2px] text-[#d4af37]">
          YOUR AI WORKSPACE
        </p>

        <p className="mt-1 text-xs text-[#9ab9a6]/60">
          What would you like to explore today?
        </p>
      </div>

      <Command size={18} className="text-emerald-300/50" />
    </div>

    <form
      onSubmit={handleSubmit}
      className="group relative overflow-hidden rounded-[24px] border border-emerald-400/25 bg-gradient-to-br from-[#09291c] to-[#04150e] p-2 shadow-[0_15px_50px_rgba(0,0,0,0.3)] transition focus-within:border-[#d4af37]/60 focus-within:shadow-[0_0_35px_rgba(16,185,129,0.10)]"
    >

      <div className="flex items-center gap-3">

        <Sparkles
          size={22}
          className="ml-3 shrink-0 text-[#d4af37]"
        />

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('askPlaceholder')}
          rows={1}
          className="max-h-28 min-h-[50px] flex-1 resize-none border-0 bg-transparent px-1 py-4 text-sm text-[#effaf3] outline-none placeholder:text-[#8ab8a0]/45 focus:ring-0"
        />

        <div className="hidden items-center gap-3 pr-3 sm:flex">
          <Paperclip size={18} className="text-emerald-200/40" />
          <ImageIcon size={18} className="text-emerald-200/40" />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim()}
          aria-label="Start chat"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f0d989] text-[#14251a] shadow-[0_5px_20px_rgba(212,175,55,0.2)] transition hover:scale-105 disabled:opacity-40"
        >
          <Send size={18} />
        </button>

      </div>
    </form>

    <p className="mt-3 text-center text-[9px] tracking-wider text-[#8ab8a0]/40">
      PRESS ENTER TO START · SHIFT + ENTER FOR NEW LINE
    </p>

  </section>

  {/* QUICK TOOLS */}
  <section className="mb-12">

    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-sm font-bold tracking-wide text-[#ecfdf5]">
        Explore AI Tools
      </h2>

      <span className="text-[9px] tracking-[2px] text-[#d4af37]/70">
        YOUR TOOLKIT
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

      {quickTools.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => routeToChat(item.prompt || '', item.tool)}
            className="group flex min-h-[100px] items-center gap-3 rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-[#0a2b1e] to-[#04150e] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.3)] sm:p-5"
          >

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 transition group-hover:border-[#d4af37]/40 group-hover:bg-emerald-400/15 group-hover:text-[#e6d28a]">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-[#ecfdf5]">
                {item.title}
              </p>

              <p className="mt-1 text-[10px] text-[#9ab9a6]/60">
                {item.subtitle}
              </p>
            </div>

          </button>
        );
      })}

    </div>
  </section>

  {/* FEATURES */}
  <section className="mb-12 grid gap-4 lg:grid-cols-2">

    <div className="rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-[#0a2b1e] to-[#04150e] p-6 sm:p-7">

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-[#d4af37]" />

          <h2 className="text-base font-bold text-[#ecfdf5]">
            Powerful Features
          </h2>
        </div>

        <span className="text-[9px] font-bold tracking-wider text-[#d4af37]">
          EXPLORE
        </span>

      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-5">

        {capabilities.map((feature) => (
          <div key={feature} className="flex items-center gap-2">

            <CheckCircle2
              size={15}
              className="shrink-0 text-emerald-400"
            />

            <span className="text-[11px] text-[#c1d9ca] sm:text-xs">
              {feature}
            </span>

          </div>
        ))}

      </div>
    </div>

    <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#123c29] to-[#04150e] p-6 sm:p-7">

      <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full bg-[#d4af37]/10 blur-[70px]" />

      <div className="relative mb-7 flex items-center gap-3">
        <TrendingUp size={20} className="text-[#d4af37]" />

        <h2 className="text-base font-bold text-[#ecfdf5]">
          AUREXA Highlights
        </h2>
      </div>

      <div className="relative flex items-center justify-between gap-4">

        <div>
          <p className="text-4xl font-black text-emerald-300">
            AI
          </p>

          <p className="mt-2 text-xs text-[#a7c5b3]/60">
            Intelligent Assistance
          </p>
        </div>

        <div className="h-14 w-px bg-[#d4af37]/20" />

        <div>
          <span className="text-5xl font-bold leading-none text-[#d4af37]">
            ∞
          </span>

          <p className="mt-2 text-xs text-[#a7c5b3]/60">
            Limitless Possibilities
          </p>
        </div>

      </div>
    </div>
  </section>

  {/* STATUS */}
  <section className="mb-12 grid gap-3 sm:grid-cols-2">

    <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5">

      <Languages size={24} className="text-emerald-300" />

      <div>
        <p className="text-sm font-bold text-[#ecfdf5]">
          Multilingual AI
        </p>

        <p className="mt-1 text-[11px] text-[#a7c5b3]/60">
          Designed with Indian users in mind.
        </p>
      </div>

    </div>

    <div className="flex items-center gap-4 rounded-2xl border border-[#d4af37]/15 bg-[#d4af37]/[0.05] p-5">

      <Clock3 size={24} className="text-[#d4af37]" />

      <div>
        <p className="text-sm font-bold text-[#ecfdf5]">
          Early Launch Stage
        </p>

        <p className="mt-1 text-[11px] text-[#a7c5b3]/60">
          Features are being tested and improved.
        </p>
      </div>

    </div>
  </section>

  {/* UPCOMING FEATURES */}
  <section className="mb-12">

    <div className="mb-6">
      <p className="text-[10px] font-bold tracking-[3px] text-[#d4af37]">
        THE FUTURE
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-[#ecfdf5]">
        Coming to AUREXA
      </h2>

      <p className="mt-2 text-xs text-[#9ab9a6]/60">
        More intelligent experiences are on their way.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">

      {upcomingFeatures.map((feature) => {
        const Icon = feature.icon;

        return (
          <div
            key={feature.number}
            className="group rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-[#0a2b1e] to-[#04150e] p-5 transition hover:-translate-y-1 hover:border-[#d4af37]/35"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 group-hover:text-[#d4af37]">
                <Icon size={20} />
              </div>

              <span className="text-[10px] text-[#9ab9a6]/50">
                {feature.number}
              </span>

            </div>

            <h3 className="mt-6 text-sm font-bold tracking-wide text-[#ecfdf5]">
              {feature.title}
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#a7c5b3]/60">
              {feature.description}
            </p>

            <p className="mt-5 border-t border-emerald-400/10 pt-4 text-[9px] font-bold tracking-[2px] text-[#d4af37]">
              {feature.status}
            </p>

          </div>
        );
      })}

    </div>
  </section>

  {/* PRO BANNER */}
  <section className="relative mb-12 overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-gradient-to-r from-[#17452e] via-[#0a2b1e] to-[#04150e] p-6 sm:p-9">

    <div className="absolute -right-5 -top-16 text-[210px] font-black text-[#d4af37]/[0.06]">
      A
    </div>

    <div className="relative flex flex-wrap items-center justify-between gap-6">

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#e6d28a]">
          <Crown size={25} />
        </div>

        <div>
          <p className="text-[9px] font-bold tracking-[3px] text-[#d4af37]">
            AUREXA / PRO
          </p>

          <h3 className="mt-2 text-lg font-bold text-[#f0fdf4]">
            {tp('title')}
          </h3>

          <p className="mt-2 max-w-lg text-xs leading-6 text-[#b5d1bf]/65">
            {tp('desc')}
          </p>
        </div>

      </div>

      <button
        type="button"
        onClick={() => router.push('/pricing')}
        className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f0d989] px-6 py-3.5 text-xs font-black text-[#14251a] transition hover:scale-105 hover:brightness-110"
      >
        {tp('cta')}
        <ArrowUpRight size={16} />
      </button>

    </div>
  </section>

  {/* FOOTER */}
  <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-400/15 pt-7">

    <div>
      <p className="text-xs font-black tracking-[3px] text-[#ecfdf5]">
        AUREXA <span className="text-[#d4af37]">AI</span>
      </p>

      <p className="mt-2 text-[9px] tracking-[2px] text-[#8ab8a0]/50">
        IMAGINE · CREATE · INNOVATE
      </p>
    </div>

    <p className="text-[10px] text-[#8ab8a0]/50">
      © {new Date().getFullYear()} AUREXA AI. All rights reserved.
    </p>

  </footer>

</main>

);
}
