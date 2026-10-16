'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

import {
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  X,
  MessageCircle,
  Plus,
} from 'lucide-react';

import Link from 'next/link';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  imageUrl?: string;
};

type Tool = 'chat' | 'solve' | 'coding';

const CHAT_ID = 'default';
const MAX_MESSAGES = 50;

function CodeBlock({
  code,
  lang,
}: {
  code: string;
  lang: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#262640]">
      <div className="flex items-center justify-between border-b border-[#262640] bg-[#0D0D18] px-3 py-2">
        <span className="text-xs text-[#94A3B8]">
          {lang || 'code'}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}

          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <SyntaxHighlighter
        language={lang || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          background: '#0D0D18',
          fontSize: '13px',
          padding: '12px',
          overflowX: 'auto',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MessageContent({
  content,
  imageUrl,
}: {
  content: string;
  imageUrl?: string;
}) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {imageUrl && (
        <div className="my-3 overflow-hidden rounded-xl border border-[#262640]">
          <img
            src={imageUrl}
            alt="AI generated image"
            loading="lazy"
            className="h-auto max-h-96 w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display =
                'none';
            }}
          />

          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 text-xs text-violet-300"
          >
            Open image
          </a>
        </div>
      )}

      {parts.map((part, index) => {
        if (
          part.startsWith('```') &&
          part.endsWith('```')
        ) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');

          return (
            <CodeBlock
              key={index}
              code={code}
              lang={lang}
            />
          );
        }

        return <span key={index}>{part}</span>;
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
  const [historyLoading, setHistoryLoading] = useState(false);

  const [usageLeft, setUsageLeft] = useState<number | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const [initialLoaded, setInitialLoaded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messagesRef = useRef<Message[]>([]);
  const sendingRef = useRef(false);
  const loadedUserRef = useRef<string | null>(null);

  const docRef = user
    ? doc(db, 'chats', user.uid)
    : null;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load history without blocking the chat interface.
  useEffect(() => {
    if (!user || !docRef) {
      setInitialLoaded(true);
      setHistoryLoading(false);
      return;
    }

    if (loadedUserRef.current === user.uid) {
      return;
    }

    let cancelled = false;

    setHistoryLoading(true);

    const loadHistory = async () => {
      try {
        const snapshot = await getDoc(docRef);

        if (cancelled) return;

        if (snapshot.exists()) {
          const data = snapshot.data();

          if (Array.isArray(data.messages)) {
            const safeMessages = data.messages
              .filter(
                (item: any) =>
                  item &&
                  (item.role === 'user' ||
                    item.role === 'assistant') &&
                  typeof item.content === 'string'
              )
              .slice(-MAX_MESSAGES) as Message[];

            setMessages(safeMessages);
          }
        }

        loadedUserRef.current = user.uid;
      } catch (error) {
        console.error('Chat history loading failed:', error);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
          setInitialLoaded(true);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user, docRef]);

  // Save chat history with a debounce.
  useEffect(() => {
    if (!user || !docRef || !initialLoaded) return;

    const timer = setTimeout(async () => {
      try {
        await setDoc(
          docRef,
          {
            messages: messages.slice(-MAX_MESSAGES),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Chat save failed:', error);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [messages, user, docRef, initialLoaded]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (
      msgText: string,
      tool: Tool = 'chat'
    ) => {
      if (!msgText.trim() || sendingRef.current) return;

      sendingRef.current = true;
      setStreaming(true);

      const userMessage: Message = {
        role: 'user',
        content: msgText.trim(),
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
      };

      const previousMessages = messagesRef.current;

      const updatedMessages = [
        ...previousMessages,
        userMessage,
        assistantMessage,
      ];

      messagesRef.current = updatedMessages;
      setMessages(updatedMessages);
      setInput('');

      try {
        const idToken = user
          ? await user.getIdToken()
          : null;

        const history = previousMessages
          .slice(-20)
          .map((message) => ({
            role: message.role,
            content: message.content,
          }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            tool,
            chatId: CHAT_ID,
            message: msgText.trim(),
            history,
          }),
        });

        if (response.status === 429) {
          const data = await response.json();

          if (data.error === 'LIMIT_REACHED') {
            setShowLimitDialog(true);

            const rolledBack = messagesRef.current.slice(0, -2);
            messagesRef.current = rolledBack;
            setMessages(rolledBack);

            return;
          }
        }

        if (!response.ok || !response.body) {
          throw new Error(
            `Chat request failed (${response.status})`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';
        let fullContent = '';

        const updateAssistant = (content: string, error = false) => {
          const current = messagesRef.current.slice();

          current[current.length - 1] = {
            role: 'assistant',
            content,
            ...(error ? { error: true } : {}),
          };

          messagesRef.current = current;
          setMessages(current);
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, {
            stream: true,
          });

          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const line = event
              .split('\n')
              .find((item) => item.startsWith('data:'));

            if (!line) continue;

            const data = line.slice(5).trim();

            if (!data || data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                fullContent = String(parsed.error);
                updateAssistant(
                  `Error: ${fullContent}`,
                  true
                );
                continue;
              }

              if (typeof parsed.token === 'string') {
                fullContent += parsed.token;
                updateAssistant(fullContent);
              }
            } catch {
              // Ignore malformed streaming events.
            }
          }
        }

        if (!fullContent.trim()) {
          updateAssistant(
            'No response received. Please try again.',
            true
          );
        }

        setUsageLeft((current) =>
          current !== null
            ? Math.max(0, current - 1)
            : null
        );
      } catch (error) {
        console.error('AI chat error:', error);

        const current = messagesRef.current.slice();

        current[current.length - 1] = {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Please try again.',
          error: true,
        };

        messagesRef.current = current;
        setMessages(current);
      } finally {
        sendingRef.current = false;
        setStreaming(false);
        inputRef.current?.focus();
      }
    },
    [user]
  );

  // Process an initial prompt once, after loading existing history.
  useEffect(() => {
    if (!initialLoaded) return;

    const params = new URLSearchParams(window.location.search);
    const initialMessage = params.get('q');

    if (!initialMessage) return;

    const toolValue = params.get('tool');
    const validTool: Tool =
      toolValue === 'solve' || toolValue === 'coding'
        ? toolValue
        : 'chat';

    window.history.replaceState({}, '', '/chat');

    void sendMessage(initialMessage, validTool);
  }, [initialLoaded, sendMessage]);

  const generateImage = async (prompt: string) => {
    if (!prompt.trim() || imageLoading) return;

    setImageLoading(true);
    setShowImageModal(false);

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt.trim()
      )}?model=flux&width=768&height=768&nologo=true`;

    const nextMessages = [
      ...messagesRef.current,
      {
        role: 'user' as const,
        content: `🎨 Image: ${prompt.trim()}`,
      },
      {
        role: 'assistant' as const,
        content: `Here is your image: ${prompt.trim()}`,
        imageUrl,
      },
    ];

    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setImagePrompt('');
    setImageLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleImageSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void generateImage(imagePrompt);
  };

  const clearChat = () => {
    if (sendingRef.current) return;

    messagesRef.current = [];
    setMessages([]);
  };

  return (
    <div className="relative flex h-[calc(100dvh-120px)] min-h-[420px] flex-col gap-3 overflow-hidden">
      <div className="pointer-events-none absolute -top-8 -right-16 h-48 w-48 rounded-full bg-[#6366F1]/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between">
        <Link
          href="/"
          className="glass flex items-center gap-1 rounded-full px-3 py-2 text-sm text-[#94A3B8] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('home')}
        </Link>

        <div className="flex items-center gap-2">
          {historyLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="glass flex items-center gap-1 rounded-full px-3 py-2 text-xs text-[#94A3B8] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </button>
          )}

          {usageLeft !== null && (
            <span className="glass rounded-full px-3 py-2 text-xs text-[#94A3B8]">
              {usageLeft}/27 {tc('leftToday')}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <main
        ref={scrollRef}
        className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="text-lg font-bold text-white">
              AUREXA AI 2.0
            </h2>

            <p className="max-w-xs text-sm text-[#94A3B8]">
              {tc('emptyState')}
            </p>

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="mt-2 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white"
            >
              <ImageIcon className="h-4 w-4" />
              Create Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-1 py-2">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={
                  message.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={`max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                      : message.error
                        ? 'rounded-bl-md border border-red-500/30 bg-red-500/5 text-red-300'
                        : 'glass rounded-bl-md text-white'
                  }`}
                >
                  {message.role === 'assistant' &&
                  message.content === '' &&
                  streaming ? (
                    <div className="flex items-center gap-2 py-1">
                      {[0, 1, 2].map((item) => (
                        <span
                          key={item}
                          className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                          style={{
                            animationDelay: `${item * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      <MessageContent
                        content={message.content}
                        imageUrl={message.imageUrl}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="glass relative z-10 flex shrink-0 items-center gap-2 rounded-full px-3 py-2"
      >
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#262640]"
          aria-label="Create image"
        >
          <ImageIcon className="h-4 w-4 text-violet-300" />
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={tc('inputPlaceholder')}
          disabled={streaming}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-[#94A3B8] disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient disabled:opacity-40"
          aria-label="Send message"
        >
          {streaming ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </button>
      </form>

      {/* Daily limit dialog */}
      <AnimatePresence>
        {showLimitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5"
            onClick={() => setShowLimitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="glass w-full max-w-sm rounded-3xl p-6"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-400" />

                <h3 className="text-lg font-bold text-white">
                  {tc('limitTitle')}
                </h3>

                <p className="text-sm text-[#94A3B8]">
                  {tc('limitDesc')}
                </p>

                <Link
                  href="/pricing"
                  className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-center text-sm font-bold text-white"
                >
                  {tc('upgrade')} ₹57/{tc('month')}
                </Link>

                <button
                  type="button"
                  onClick={() => setShowLimitDialog(false)}
                  className="w-full rounded-xl border border-[#262640] px-4 py-3 text-sm text-[#94A3B8]"
                >
                  {tc('comeBackTomorrow')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="glass w-full max-w-sm rounded-3xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-violet-400" />
                  <h3 className="font-bold text-white">
                    Create Image
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  aria-label="Close"
                  className="rounded-full p-2 hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              <p className="mb-3 text-sm text-[#94A3B8]">
                Describe the image you want.
              </p>

              <form
                onSubmit={handleImageSubmit}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={imagePrompt}
                  onChange={(event) =>
                    setImagePrompt(event.target.value)
                  }
                  placeholder="Describe your image..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#262640] bg-[#0D0D18] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
                />

                <button
                  type="submit"
                  disabled={!imagePrompt.trim() || imageLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {imageLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}

                  Create Image
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  }
