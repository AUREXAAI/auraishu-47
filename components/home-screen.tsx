'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  Send,
  Code2,
  Image as ImageIcon,
  Clapperboard,
  ChevronRight,
  Crown,
  MessageCircle,
  Bot,
  Lightbulb,
  Video,
  Scissors,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type Feature = {
  key: string;
  icon: LucideIcon;
  color: string;
  glowClass: string;
  spanTwo?: boolean;
  tool?: 'chat' | 'solve' | 'coding';
};

const features: Feature[] = [
  { key: 'chat', icon: Bot, color: '#6366F1', glowClass: 'glow-chat', tool: 'chat' },
  { key: 'solve', icon: Lightbulb, color: '#A855F7', glowClass: 'glow-solve', tool: 'solve' },
  { key: 'coding', icon: Code2, color: '#10B981', glowClass: 'glow-coding', tool: 'coding' },
  { key: 'image', icon: ImageIcon, color: '#EC4899', glowClass: 'glow-image' },
  { key: 'video', icon: Video, color: '#06B6D4', glowClass: 'glow-video' },
  { key: 'editor', icon: Scissors, color: '#F59E0B', glowClass: 'glow-editor' },
  { key: 'courses', icon: GraduationCap, color: '#A855F7', glowClass: 'glow-courses', spanTwo: true },
];

const chips: { key: string; icon: LucideIcon; tool?: 'chat' | 'solve' | 'coding' }[] = [
  { key: 'explain', icon: Sparkles, tool: 'chat' },
  { key: 'writeCode', icon: Code2, tool: 'coding' },
  { key: 'createImage', icon: ImageIcon },
  { key: 'makeVideo', icon: Clapperboard },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

function routeToChat(router: ReturnType<typeof useRouter>, message: string, tool: 'chat' | 'solve' | 'coding' = 'chat') {
  const lower = message.toLowerCase();
  const resolvedTool = lower.includes('code') || lower.includes('debug') || lower.includes('function') ? 'coding' : tool;
  router.push(`/chat?q=${encodeURIComponent(message)}&tool=${resolvedTool}`);
}

export default function HomeScreen() {
  const t = useTranslations('home');
  const tf = useTranslations('features');
  const tp = useTranslations('pro');
  const { user } = useAuth();
  const router = useRouter();
  const [askText, setAskText] = useState('');
  const displayName = user?.displayName || t('username');

  const handleAsk = () => {
    if (!askText.trim()) return;
    routeToChat(router, askText);
    setAskText('');
  };

  const handleFeatureClick = (feature: Feature) => {
    if (feature.tool) {
      router.push(`/chat?tool=${feature.tool}`);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="relative flex flex-col gap-6">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute -top-12 -left-16 h-56 w-56 rounded-full bg-[#6366F1]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      {/* Greeting */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="glass inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-[#94A3B8]">
            <Sparkles className="h-3 w-3 text-[#8B5CF6]" />
            {t('greeting')}
          </span>
          <span className="font-heading text-3xl font-extrabold gradient-text">
            {displayName} 👋
          </span>
          <span className="text-sm text-[#94A3B8]">{t('sub')}</span>
        </div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="glow-pulse flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient glow-violet"
        >
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path d="M16 7L23 24H19.5L16 14.5L12.5 24H9L16 7Z" fill="white" fillOpacity="0.95" />
            <path d="M13 20H19V22.5H13V20Z" fill="white" fillOpacity="0.95" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Ask Card */}
      <motion.div variants={item}>
        <div className="glass glow-pulse rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/15">
              <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <input
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={t('askPlaceholder')}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-[#94A3B8] focus:outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleAsk}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient glow-violet"
            >
              <Send className="h-4 w-4 text-white" />
            </motion.button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map(({ key, icon: Icon, tool }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                onClick={() => tool && router.push(`/chat?tool=${tool}`)}
                className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[#94A3B8] transition-colors hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
                {t(`chips.${key}`)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Explore Features */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-white">{t('explore')}</h2>
          <button className="flex items-center gap-1 text-sm font-medium text-[#8B5CF6]">
            {t('allTools')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.key}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -4 }}
                onClick={() => handleFeatureClick(feature)}
                className={`glass group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl p-4 text-left transition-colors ${feature.spanTwo ? 'col-span-2' : ''}`}
                style={{ borderColor: `${feature.color}33` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, ${feature.color}14, transparent 60%)` }}
                />
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${feature.glowClass}`}
                  style={{ backgroundColor: `${feature.color}1A` }}
                >
                  <Icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-sm font-semibold text-white">
                    {tf(`${feature.key}.title`)}
                  </span>
                  <span className="text-xs leading-relaxed text-[#94A3B8]">
                    {tf(`${feature.key}.desc`)}
                  </span>
                </div>
                <ChevronRight
                  className="h-4 w-4 self-end text-[#94A3B8] transition-transform group-hover:translate-x-0.5"
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Unlock Pro Banner */}
      <motion.div variants={item}>
        <div className="shimmer glow-pulse relative overflow-hidden rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20"
            >
              <Crown className="h-5 w-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-heading text-sm font-bold text-white">{tp('title')}</h3>
              <p className="text-xs leading-relaxed text-white/85">{tp('desc')}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/pricing')}
              className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#6D28D9] shadow-lg"
            >
              {tp('cta')}
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Recent */}
      <motion.div variants={item} className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-white">{t('recent')}</h2>
          <button className="flex items-center gap-1 text-sm font-medium text-[#8B5CF6]">
            {t('viewAll')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => router.push('/chat')}
          className="glass flex items-center gap-3 rounded-2xl p-3.5 text-left transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/15 glow-chat">
            <MessageCircle className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <span className="font-heading text-sm font-semibold text-white">{t('recentNewChat')}</span>
            <p className="text-xs text-[#94A3B8]">{t('recentChatDesc')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-[#94A3B8]">{t('recentTime')}</span>
            <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
