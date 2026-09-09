'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Send, Sparkles, Loader2, Copy, Check, AlertCircle, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '@/lib/auth-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  imageUrl?: string;
};

type Tool = 'chat' | 'solve' | 'coding';

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-2 overflow-hidden rounded-xl border border-[#262640]">
      <div className="flex items-center justify-between border-b border-[#262640] bg-[#0D0D18] px-3 py-1.5">
        <span className="text-xs text-[#94A3B8]">{lang || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[#94A3B8] transition-colors hover:text-white">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || 'text'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, background: '#0D0D18', fontSize: '13px', padding: '12px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function SmartImage({ src }: { src: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prompt = src.includes('/prompt/')
    ? decodeURIComponent(src.split('/prompt/')[1].split('?')[0])
    : 'nature';
  const keywords = (prompt.match(/[a-zA-Z0-9]+/g) || ['nature']).slice(0, 3).join(',');
  const fallback = `https://loremflickr.com/768/768/${keywords}`;
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#262640] bg-[#0D0D18]">
      {!failed && (
        <img
          src={useFallback ? fallback : src}
          alt={prompt}
          className={`w-full h-auto max-h-96 object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!useFallback) {
              setUseFallback(true);
              setLoaded(false);
            } else {
              setFailed(true);
            }
          }}
        />
      )}
      {!loaded && !failed && (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#94A3B8]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating image... (10-60 seconds)
        </div>
      )}
      {failed && (
        <div className="py-6 text-center text-xs text-[#94A3B8]">
          Image service unavailable. Please try again later.
        </div>
      )}
    </div>
  );
}

function MessageContent({ content, imageUrl }: { content: string; imageUrl?: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {imageUrl && <SmartImage src={imageUrl} />}
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');
          return <CodeBlock key={i} code={code} lang={lang} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('chat');
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [usageLeft, setUsageLeft] = useState<number | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialMsg = params.get('q');
      const tool = (params.get('tool') as Tool) || 'chat';
      if (initialMsg) {
        setInput(initialMsg);
        sendMessage(initialMsg, tool);
        window.history.replaceState({}, '', '/chat');
      }
    }
  }, []);

  const generateImage = async (prompt: string) => {
    if (!prompt.trim() || imageLoading) return;

    const userMsg: Message = { role: 'user', content: `🎨 Image: ${prompt}` };
    setMessages((prev) => [...prev, userMsg]);
    setImagePrompt('');
    setShowImageModal(false);
    setImageLoading(true);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=${Date.now()}`;

    const assistantMsg: Message = {
      role: 'assistant',
      content: `Here is your image: **${prompt}** 🎨`,
      imageUrl,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setImageLoading(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (msgText: string, tool: Tool = 'chat') => {
    if (!msgText.trim() || streaming) return;

    const userMsg: Message = { role: 'user', content: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const idToken = await user?.getIdToken();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, tool, chatId: 'default', message: msgText, history }),
      });

      if (res.status === 429) {
        const data = await res.json();
        if (data.error === 'LIMIT_REACHED') {
          setShowLimitDialog(true);
          setMessages((prev) => prev.slice(0, -1));
          setStreaming(false);
          return;
        }
      }

      if (!res.ok || !res.body) {
        throw new Error('Request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              fullContent = `Error: ${parsed.error}`;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: fullContent, error: true };
                return copy;
              });
              break;
            }
            if (parsed.token) {
              fullContent += parsed.token;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: fullContent };
                return copy;
              });
            }
          } catch {
            // skip
          }
        }
      }

      setUsageLeft((prev) => (prev !== null ? prev - 1 : null));
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          error: true,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImage(imagePrompt);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm text-[#94A3B8] transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {t('home')}
        </Link>
        {usageLeft !== null && (
          <span className="rounded-full border border-[#262640] bg-[#1A1A2E] px-3 py-1 text-xs font-medium text-[#94A3B8]">
            {usageLeft}/27 {tc('leftToday')}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/15 glow-chat">
              <Sparkles className="h-7 w-7 text-[#6366F1]" />
            </div>
            <p className="text-sm text-[#94A3B8]">{tc('emptyState')}</p>
            <button
              onClick={() => setShowImageModal(true)}
              className="mt-2 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white glow-violet"
            >
              <ImageIcon className="h-4 w-4" />
              Create Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm text-white">
                    {msg.content}
                  </div>
                ) : (
                  <div className={`max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm ${msg.error ? 'border-red-500/30 bg-red-500/5 text-red-300' : 'border-[#262640] bg-[#1A1A2E] text-white'}`}>
                    {msg.content === '' && streaming ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#6366F1]" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        <MessageContent content={msg.content} imageUrl={msg.imageUrl} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-[#262640] bg-[#12121F] px-4 py-2.5">
        <motion.button
          type="button"
          onClick={() => setShowImageModal(true)}
          whileTap={{ scale: 0.88 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#262640] transition-colors hover:bg-[#363650]"
          title="Create Image"
        >
          <ImageIcon className="h-4 w-4 text-[#94A3B8]" />
        </motion.button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tc('inputPlaceholder')}
          disabled={streaming}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-[#94A3B8] focus:outline-none disabled:opacity-50"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.88 }}
          disabled={streaming || !input.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient glow-violet disabled:opacity-50"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
        </motion.button>
      </form>

      <AnimatePresence>
        {showLimitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6"
            onClick={() => setShowLimitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#262640] bg-[#12121F] p-6"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">{tc('limitTitle')}</h3>
                <p className="text-sm text-[#94A3B8]">{tc('limitDesc')}</p>
                <div className="flex w-full flex-col gap-2">
                  <Link
                    href="/pricing"
                    className="rounded-xl bg-brand-gradient px-4 py-3 text-center font-heading text-sm font-semibold text-white glow-violet"
                  >
                    {tc('upgrade')} ₹57/{tc('month')}
                  </Link>
                  <button
                    onClick={() => setShowLimitDialog(false)}
                    className="rounded-xl border border-[#262640] px-4 py-3 text-sm text-[#94A3B8] transition-colors hover:text-white"
                  >
                    {tc('comeBackTomorrow')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#262640] bg-[#12121F] p-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">Create Image</h3>
                  </div>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#262640]"
                  >
                    <X className="h-4 w-4 text-[#94A3B8]" />
                  </button>
                </div>

                <p className="text-sm text-[#94A3B8]">
                  Describe the image you want
                </p>

                <form onSubmit={handleImageSubmit} className="flex flex-col gap-3">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe what you want..."
                    rows={3}
                    autoFocus
                    className="w-full resize-none rounded-xl border border-[#262640] bg-[#0D0D18] px-4 py-3 text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={imageLoading || !imagePrompt.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-heading text-sm font-semibold text-white glow-violet disabled:opacity-50"
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Image
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
