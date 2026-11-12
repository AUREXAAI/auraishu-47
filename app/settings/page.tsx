'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
Globe,
LogOut,
Check,
ChevronRight,
Volume2,
Play,
Mic,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';

const languages = [
{ code: 'en', label: 'English' },
{ code: 'kn', label: 'ಕನ್ನಡ' },
{ code: 'hi', label: 'हिन्दी' },
] as const;

const voices = [
{ id: 'female', label: 'Female Voice', description: 'Natural female voice', icon: '👩' },
{ id: 'male', label: 'Male Voice', description: 'Natural male voice', icon: '👨' },
] as const;

export default function SettingsPage() {
const t = useTranslations('nav');
const ts = useTranslations('settings');
const router = useRouter();
const { signOut } = useAuth();

const [currentLang, setCurrentLang] = useState('en');
const [showLangOptions, setShowLangOptions] = useState(false);
const [selectedVoice, setSelectedVoice] = useState('female');
const [isPreviewing, setIsPreviewing] = useState(false);

useEffect(() => {
const match = document.cookie.match(
new RegExp('(?:^|; )aurexa_lang=([^;]*)')
);

if (match) {
  setCurrentLang(decodeURIComponent(match[1]));
}

const savedVoice = localStorage.getItem('aurexa_voice_gender');

if (savedVoice === 'female' || savedVoice === 'male') {
  setSelectedVoice(savedVoice);
}

}, []);

const chooseLanguage = (code: string) => {
document.cookie = "aurexa_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax";
setCurrentLang(code);
setShowLangOptions(false);
router.refresh();
};

const chooseVoice = (voice: string) => {
setSelectedVoice(voice);
localStorage.setItem('aurexa_voice_gender', voice);

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.cancel();
  setIsPreviewing(false);
}

};

const previewVoice = () => {
if (!('speechSynthesis' in window)) {
alert('Voice preview is not supported in this browser.');
return;
}

window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(
  currentLang === 'kn'
    ? 'ನಮಸ್ಕಾರ! ನಾನು AUREXA AI. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
    : currentLang === 'hi'
      ? 'नमस्ते! मैं AUREXA AI हूँ। मैं आपकी कैसे मदद कर सकता हूँ?'
      : 'Hello! I am AUREXA AI. How can I help you today?'
);

const langMap: Record<string, string> = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
};

utterance.lang = langMap[currentLang] || 'en-IN';
utterance.rate = 0.95;
utterance.pitch = selectedVoice === 'female' ? 1.15 : 0.9;

const availableVoices = window.speechSynthesis.getVoices();

const matchingVoices = availableVoices.filter((voice) =>
  voice.lang.toLowerCase().startsWith(currentLang)
);

const genderKeywords =
  selectedVoice === 'female'
    ? ['female', 'woman', 'zira', 'samantha', 'heera', 'kalpana']
    : ['male', 'man', 'david', 'ravi', 'hemant'];

const matchedVoice = matchingVoices.find((voice) =>
  genderKeywords.some((keyword) =>
    voice.name.toLowerCase().includes(keyword)
  )
);

if (matchedVoice) {
  utterance.voice = matchedVoice;
}

utterance.onstart = () => setIsPreviewing(true);
utterance.onend = () => setIsPreviewing(false);
utterance.onerror = () => setIsPreviewing(false);

window.speechSynthesis.speak(utterance);

};

const handleLogout = async () => {
await signOut();
router.push('/auth');
};

return (
<motion.div
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
className="flex flex-col gap-6 pt-2"
>
<h1 className="font-heading text-2xl font-bold text-[#F5F5E9]">
{t('settings')}
</h1>

  {/* Language Section */}
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-[#D4AF37]" />
      <span className="font-heading text-sm font-semibold text-white">
        {ts('language')}
      </span>
    </div>

    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowLangOptions(!showLangOptions)}
      className="flex items-center gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#064E3B] p-4 text-left transition-colors hover:bg-[#0A5A43]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15">
        <Globe className="h-5 w-5 text-[#D4AF37]" />
      </div>

      <div className="flex-1">
        <span className="font-heading text-sm font-semibold text-white">
          {ts('language')}
        </span>
        <p className="text-xs text-[#A6B5A9]">{ts('languageDesc')}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-[#D4AF37]">
          {languages.find((l) => l.code === currentLang)?.label}
        </span>
        <ChevronRight
          className={`h-4 w-4 text-[#A6B5A9] transition-transform ${
            showLangOptions ? 'rotate-90' : ''
          }`}
        />
      </div>
    </motion.button>

    {showLangOptions && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="flex flex-col gap-2"
      >
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileTap={{ scale: 0.97 }}
            onClick={() => chooseLanguage(lang.code)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
              currentLang === lang.code
                ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10'
                : 'border-[#D4AF37]/15 bg-[#0A2B1E] hover:bg-[#064E3B]'
            }`}
          >
            <span className="font-heading text-sm font-medium text-white">
              {lang.label}
            </span>
            {currentLang === lang.code && (
              <Check className="h-4 w-4 text-[#D4AF37]" />
            )}
          </motion.button>
        ))}
      </motion.div>
    )}
  </div>

  {/* Live Talk Voice Section */}
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4 text-[#D4AF37]" />
      <span className="font-heading text-sm font-semibold text-white">
        Live Talk Voice
      </span>
    </div>

    <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#064E3B] p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15">
          <Mic className="h-5 w-5 text-[#D4AF37]" />
        </div>

        <div>
          <p className="font-heading text-sm font-semibold text-white">
            Choose AI Voice
          </p>
          <p className="text-xs text-[#A6B5A9]">
            Select your preferred voice for Live Talk.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {voices.map((voice) => (
          <motion.button
            key={voice.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => chooseVoice(voice.id)}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
              selectedVoice === voice.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-[#D4AF37]/15 bg-[#0A2B1E] hover:bg-[#103D2C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{voice.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {voice.label}
                </p>
                <p className="text-xs text-[#A6B5A9]">
                  {voice.description}
                </p>
              </div>
            </div>

            {selectedVoice === voice.id && (
              <Check className="h-5 w-5 text-[#D4AF37]" />
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={previewVoice}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#030D09] transition-colors hover:bg-[#E8D28A]"
      >
        <Play className="h-4 w-4" />
        {isPreviewing ? 'Playing Voice...' : 'Preview Selected Voice'}
      </motion.button>

      <p className="mt-3 text-center text-[11px] text-[#A6B5A9]">
        Available voices depend on your device and browser.
      </p>
    </div>
  </div>

  {/* Logout Section */}
  <div className="flex flex-col gap-3">
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleLogout}
      className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
        <LogOut className="h-5 w-5 text-red-400" />
      </div>

      <div className="flex-1">
        <span className="font-heading text-sm font-semibold text-white">
          {ts('logout')}
        </span>
        <p className="text-xs text-[#A6B5A9]">{ts('logoutDesc')}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-[#A6B5A9]" />
    </motion.button>
  </div>
</motion.div>

);
                                              }
