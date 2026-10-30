'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import type {
  FormEvent,
  CSSProperties,
} from 'react';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  Code2,
  Brain,
  Trash2,
  Menu,
  Zap,
  ChevronRight,
  WandSparkles,
} from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import {
  Prism as SyntaxHighlighter,
} from 'react-syntax-highlighter';

import {
  vscDarkPlus,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

import './chat-3d.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  imageUrl?: string;
};

type Tool = 'chat' | 'solve' | 'coding';

const CHAT_ID = 'default';
const MAX_MESSAGES = 50;

const tools: {
  id: Tool;
  label: string;
  description: string;
  icon: typeof MessageCircle;
}[] = [
  {
    id: 'chat',
    label: 'AI Chat',
    description: 'Ask anything',
    icon: MessageCircle,
  },
  {
    id: 'solve',
    label: 'Solve',
    description: 'Understand problems',
    icon: Brain,
  },
  {
    id: 'coding',
    label: 'Coding',
    description: 'Build with AI',
    icon: Code2,
  },
];

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

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="a3-codeblock">
      <div className="a3-codehead">
        <span>{lang || 'code'}</span>

        <button
          type="button"
          onClick={handleCopy}
          className="a3-copy"
        >
          {copied ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}

          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <SyntaxHighlighter
        language={lang || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '16px',
          background: 'rgba(7, 7, 18, 0.96)',
          fontSize: '13px',
          lineHeight: '1.75',
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
        <div className="a3-generated-image">
          <img
            src={imageUrl}
            alt="AI generated artwork"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />

          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open full image <ChevronRight size={14} />
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

        return (
          <span
            key={index}
            className="whitespace-pre-wrap break-words"
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

function OrbScene({
  active,
  onClick,
}: {
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Interactive AUREXA AI orb"
      onClick={onClick}
      className={`a3-orb-button ${active ? 'is-active' : ''}`}
    >
      <div className="a3-orb-scene">
        <div className="a3-orb-aura" />

        <div className="a3-orb-ring a3-ring-one" />
        <div className="a3-orb-ring a3-ring-two" />
        <div className="a3-orb-ring a3-ring-three" />

        <div className="a3-orb-core">
          <div className="a3-orb-core-inner">
            <Sparkles size={30} strokeWidth={1.5} />
          </div>
        </div>

        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="a3-particle"
            style={{
              '--particle-index': index,
            } as CSSProperties}
          />
        ))}
      </div>
    </button>
  );
}

export default function ChatPage() {
  const t = useTranslations('nav');
  const tc = useTranslations('chat');

  const { user } = useAuth();

  const userId = user?.uid ?? null;

  const docRef = useMemo(
    () => userId
      ? doc(db, 'chats', userId)
      : null,
    [userId]
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const [selectedTool, setSelectedTool] =
    useState<Tool>('chat');

  const [streaming, setStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [orbActive, setOrbActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messagesRef = useRef<Message[]>([]);
  const sendingRef = useRef(false);
  const loadedUserRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load saved conversation.
  useEffect(() => {
    if (!userId || !docRef) {
      loadedUserRef.current = null;
      setInitialLoaded(true);
      setHistoryLoading(false);
      return;
    }

    const currentUserId = userId;
    const currentDocRef = docRef;

    let cancelled = false;

    setInitialLoaded(false);
    setHistoryLoading(true);

    if (loadedUserRef.current === currentUserId) {
      setHistoryLoading(false);
      setInitialLoaded(true);
      return;
    }

    async function loadHistory() {
      try {
        const snapshot = await getDoc(currentDocRef);

        if (cancelled) return;

        if (snapshot.exists()) {
          const data = snapshot.data();

          if (Array.isArray(data.messages)) {
            const safeMessages = data.messages
              .filter(
                (item: any) =>
                  item &&
                  (
                    item.role === 'user' ||
                    item.role === 'assistant'
                  ) &&
                  typeof item.content === 'string'
              )
              .slice(-MAX_MESSAGES) as Message[];

            messagesRef.current = safeMessages;
            setMessages(safeMessages);
          } else {
            messagesRef.current = [];
            setMessages([]);
          }
        } else {
          messagesRef.current = [];
          setMessages([]);
        }

        loadedUserRef.current = currentUserId;

      } catch (error) {
        console.error(
          'Chat history loading failed:',
          error
        );

      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
          setInitialLoaded(true);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [userId, docRef]);

  // Debounced Firebase history saving.
  useEffect(() => {
    if (
      !userId ||
      !docRef ||
      !initialLoaded ||
      loadedUserRef.current !== userId
    ) {
      return;
    }

    const currentDocRef = docRef;

    const timer = window.setTimeout(async () => {
      try {
        await setDoc(
          currentDocRef,
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

    return () => window.clearTimeout(timer);
  }, [messages, userId, docRef, initialLoaded]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (
      messageText: string,
      tool: Tool = selectedTool
    ) => {
      if (!messageText.trim() || sendingRef.current) return;

      sendingRef.current = true;
      setStreaming(true);
      setOrbActive(true);

      const cleanText = messageText.trim();

      const userMessage: Message = {
        role: 'user',
        content: cleanText,
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
            message: cleanText,
            history,
          }),
        });

        if (response.status === 429) {
          let data: any = {};

          try {
            data = await response.json();
          } catch {
            // The server may return a non-JSON error.
          }

          if (data.error === 'LIMIT_REACHED') {
            setShowLimitDialog(true);

            const rolledBack =
              messagesRef.current.slice(0, -2);

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

        const updateAssistant = (
          content: string,
          error = false
        ) => {
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
              // Ignore malformed SSE events.
            }
          }
        }

        if (!fullContent.trim()) {
          updateAssistant(
            'No response received. Please try again.',
            true
          );
        }

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
        setOrbActive(false);
        inputRef.current?.focus();
      }
    },
    [user, selectedTool]
  );

  // Support opening the page with ?q=...&tool=...
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

    setSelectedTool(validTool);

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

    const nextMessages: Message[] = [
      ...messagesRef.current,
      {
        role: 'user',
        content: `Image: ${prompt.trim()}`,
      },
      {
        role: 'assistant',
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleImageSubmit = (event: FormEvent) => {
    event.preventDefault();
    void generateImage(imagePrompt);
  };

  const clearChat = () => {
    if (sendingRef.current) return;

    messagesRef.current = [];
    setMessages([]);
    setShowMobileMenu(false);
  };

  const activeTool =
    tools.find((tool) => tool.id === selectedTool) || tools[0];

  return (
    <div className="a3-page">
      <div className="a3-ambient a3-ambient-one" />
      <div className="a3-ambient a3-ambient-two" />
      <div className="a3-grid" />

      {/* Top navigation */}
      <header className="a3-header">
        <div className="a3-brand">
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="a3-icon-button a3-mobile-menu"
            aria-label="Toggle menu"
          >
            <Menu size={19} />
          </button>

          <Link href="/" className="a3-logo">
            <span className="a3-logo-symbol">
              <Sparkles size={20} />
            </span>

            <span className="a3-logo-text">
              AUREXA
              <span> AI 2.0</span>
            </span>
          </Link>

          <span className="a3-header-divider" />

          <span className="a3-workspace-label">
            AI Workspace
          </span>
        </div>

        <div className="a3-header-actions">
          {historyLoading && (
            <Loader2
              size={16}
              className="animate-spin text-violet-300"
            />
          )}

          <span className="a3-status">
            <span className="a3-status-dot" />
            AI Online
          </span>

          <Link
            href="/pricing"
            className="a3-upgrade-button"
          >
            <Zap size={14} />
            <span>Upgrade</span>
          </Link>
        </div>
      </header>

      <div className="a3-layout">
        {/* Sidebar */}
        <AnimatePresence>
          {(showMobileMenu || true) && (
            <motion.aside
              initial={false}
              animate={{
                x: 0,
                opacity: 1,
              }}
              className={`a3-sidebar ${
                showMobileMenu ? 'a3-sidebar-open' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  clearChat();
                  setShowMobileMenu(false);
                }}
                className="a3-new-chat"
              >
                <Plus size={17} />
                New conversation
              </button>

              <div className="a3-sidebar-label">
                WORKSPACE
              </div>

              <button
                type="button"
                className="a3-nav-item a3-nav-active"
                onClick={() => setShowMobileMenu(false)}
              >
                <MessageCircle size={17} />
                <span>AI Chat</span>
                <span className="a3-nav-indicator" />
              </button>

              <button
                type="button"
                className="a3-nav-item"
                onClick={() => {
                  setSelectedTool('solve');
                  setShowMobileMenu(false);
                }}
              >
                <Brain size={17} />
                <span>Problem Solver</span>
              </button>

              <button
                type="button"
                className="a3-nav-item"
                onClick={() => {
                  setSelectedTool('coding');
                  setShowMobileMenu(false);
                }}
              >
                <Code2 size={17} />
                <span>Code Assistant</span>
              </button>

              <button
                type="button"
                className="a3-nav-item"
                onClick={() => {
                  setShowImageModal(true);
                  setShowMobileMenu(false);
                }}
              >
                <WandSparkles size={17} />
                <span>Image Studio</span>
              </button>

              <div className="a3-sidebar-label a3-history-label">
                CURRENT SESSION
              </div>

              <div className="a3-session-card">
                <div className="a3-session-icon">
                  <Sparkles size={16} />
                </div>

                <div className="a3-session-info">
                  <strong>AI Conversation</strong>
                  <span>
                    {messages.length === 0
                      ? 'Ready to explore'
                      : `${messages.length} messages`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearChat}
                  aria-label="Clear chat"
                  className="a3-small-icon"
                  disabled={streaming}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="a3-sidebar-spacer" />

              <div className="a3-plan-card">
                <div className="a3-plan-glow" />

                <div className="a3-plan-icon">
                  <Sparkles size={17} />
                </div>

                <strong>Your AI journey</strong>

                <p>
                  Unlock more possibilities with AUREXA Premium.
                </p>

                <Link href="/pricing">
                  Explore Premium
                  <ChevronRight size={15} />
                </Link>
              </div>

              <Link href="/" className="a3-sidebar-home">
                <ArrowLeft size={15} />
                {t('home')}
              </Link>
            </motion.aside>
          )}
        </AnimatePresence>

        {showMobileMenu && (
          <button
            type="button"
            aria-label="Close menu"
            className="a3-mobile-overlay"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Main chat */}
        <main className="a3-main">
          <div className="a3-chat-toolbar">
            <div className="a3-toolbar-title">
              <span className="a3-toolbar-mark">
                <Sparkles size={15} />
              </span>

              <div>
                <strong>{activeTool.label}</strong>
                <span>{activeTool.description}</span>
              </div>
            </div>

            <div className="a3-toolbar-actions">
              <span className="a3-model-pill">
                <span className="a3-model-dot" />
                AUREXA Engine
              </span>

              <button
                type="button"
                onClick={clearChat}
                disabled={streaming || messages.length === 0}
                className="a3-icon-button"
                title="New conversation"
                aria-label="New conversation"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <section
            ref={scrollRef}
            className="a3-messages"
          >
            {messages.length === 0 ? (
              <div className="a3-welcome">
                <div className="a3-orb-stage">
                  <div className="a3-stage-ring a3-stage-ring-one" />
                  <div className="a3-stage-ring a3-stage-ring-two" />
                  <div className="a3-stage-ring a3-stage-ring-three" />

                  <OrbScene
                    active={orbActive}
                    onClick={() => {
                      setOrbActive(!orbActive);
                      window.setTimeout(
                        () => setOrbActive(false),
                        1500
                      );
                    }}
                  />

                  <span className="a3-orb-caption">
                    INTELLIGENCE CORE
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="a3-welcome-copy"
                >
                  <div className="a3-eyebrow">
                    <span />
                    YOUR INTELLIGENT ASSISTANT
                  </div>

                  <h1>
                    Imagine beyond.
                    <br />
                    <span>Create with AUREXA.</span>
                  </h1>

                  <p>
                    Explore ideas, solve complex problems,
                    write code, and bring your imagination
                    to life.
                  </p>
                </motion.div>

                <div className="a3-tool-grid">
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;

                    return (
                      <motion.button
                        key={tool.id}
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.2 + index * 0.08,
                        }}
                        onClick={() => {
                          setSelectedTool(tool.id);
                          inputRef.current?.focus();
                        }}
                        className={`a3-tool-card ${
                          selectedTool === tool.id
                            ? 'a3-tool-selected'
                            : ''
                        }`}
                      >
                        <span className="a3-tool-icon">
                          <Icon size={19} />
                        </span>

                        <span className="a3-tool-copy">
                          <strong>{tool.label}</strong>
                          <small>{tool.description}</small>
                        </span>

                        <ChevronRight
                          size={15}
                          className="a3-tool-arrow"
                        />
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="a3-image-shortcut"
                >
                  <ImageIcon size={16} />
                  Create something visual
                  <Sparkles size={14} />
                </button>
              </div>
            ) : (
              <div className="a3-message-list">
                {messages.map((message, index) => (
                  <motion.article
                    key={`${index}-${message.role}`}
                    initial={{
                      opacity: 0,
                      y: 9,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`a3-message-row ${
                      message.role === 'user'
                        ? 'a3-user-row'
                        : 'a3-assistant-row'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="a3-avatar">
                        <Sparkles size={17} />
                      </div>
                    )}

                    <div
                      className={`a3-message-content ${
                        message.role === 'user'
                          ? 'a3-user-message'
                          : 'a3-assistant-message'
                      } ${
                        message.error
                          ? 'a3-error-message'
                          : ''
                      }`}
                    >
                      {message.role === 'assistant' &&
                      message.content === '' &&
                      streaming &&
                      index === messages.length - 1 ? (
                        <div className="a3-thinking">
                          <div className="a3-thinking-orb">
                            <Sparkles size={16} />
                          </div>

                          <span>AUREXA is thinking</span>

                          <div className="a3-thinking-dots">
                            <i />
                            <i />
                            <i />
                          </div>
                        </div>
                      ) : (
                        <MessageContent
                          content={message.content}
                          imageUrl={message.imageUrl}
                        />
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>

          {/* Composer */}
          <div className="a3-composer-wrap">
            <AnimatePresence>
              {showTools && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                  }}
                  className="a3-composer-tools"
                >
                  {tools.map((tool) => {
                    const Icon = tool.icon;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setSelectedTool(tool.id);
                          setShowTools(false);
                          inputRef.current?.focus();
                        }}
                        className={
                          selectedTool === tool.id
                            ? 'a3-composer-tool a3-composer-tool-active'
                            : 'a3-composer-tool'
                        }
                      >
                        <Icon size={16} />
                        {tool.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setShowTools(false);
                      setShowImageModal(true);
                    }}
                    className="a3-composer-tool"
                  >
                    <ImageIcon size={16} />
                    Image
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSubmit}
              className="a3-composer"
            >
              <button
                type="button"
                onClick={() => setShowTools(!showTools)}
                className={`a3-composer-add ${
                  showTools ? 'a3-add-active' : ''
                }`}
                aria-label="Open AI tools"
              >
                {showTools ? (
                  <X size={19} />
                ) : (
                  <Plus size={19} />
                )}
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (!streaming && input.trim()) {
                      void sendMessage(input);
                    }
                  }
                }}
                placeholder={
                  selectedTool === 'coding'
                    ? 'Describe what you want to build...'
                    : selectedTool === 'solve'
                      ? 'Tell me what you want to solve...'
                      : 'Ask AUREXA anything...'
                }
                rows={1}
                disabled={streaming}
                className="a3-composer-input"
              />

              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="a3-composer-image"
                aria-label="Create image"
                title="Create image"
              >
                <ImageIcon size={19} />
              </button>

              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="a3-send-button"
                aria-label="Send message"
              >
                {streaming ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>

            <div className="a3-composer-footer">
              <span>
                <Sparkles size={12} />
                Powered by AUREXA AI
              </span>

              <span>
                Enter to send · Shift + Enter for new line
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Daily limit dialog */}
      <AnimatePresence>
        {showLimitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="a3-modal-backdrop"
            onClick={() => setShowLimitDialog(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              onClick={(event) => event.stopPropagation()}
              className="a3-modal"
            >
              <div className="a3-modal-icon a3-modal-warning">
                <AlertCircle size={26} />
              </div>

              <h2>{tc('limitTitle')}</h2>

              <p>{tc('limitDesc')}</p>

              <Link
                href="/pricing"
                className="a3-modal-primary"
              >
                <Sparkles size={17} />
                {tc('upgrade')}
              </Link>

              <button
                type="button"
                onClick={() => setShowLimitDialog(false)}
                className="a3-modal-secondary"
              >
                {tc('comeBackTomorrow')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image generation modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="a3-modal-backdrop"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onClick={(event) => event.stopPropagation()}
              className="a3-modal a3-image-modal"
            >
              <div className="a3-modal-heading">
                <div className="a3-modal-icon">
                  <WandSparkles size={23} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="a3-icon-button"
                  aria-label="Close image generator"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="a3-modal-title">
                <h2>Image Studio</h2>

                <p>
                  Turn your imagination into a visual creation.
                </p>
              </div>

              <form
                onSubmit={handleImageSubmit}
                className="a3-image-form"
              >
                <label htmlFor="aurexa-image-prompt">
                  Describe your image
                </label>

                <textarea
                  id="aurexa-image-prompt"
                  value={imagePrompt}
                  onChange={(event) =>
                    setImagePrompt(event.target.value)
                  }
                  placeholder="A futuristic glass city floating among violet clouds..."
                  rows={4}
                  className="a3-image-textarea"
                />

                <button
                  type="submit"
                  disabled={
                    !imagePrompt.trim() || imageLoading
                  }
                  className="a3-modal-primary"
                >
                  {imageLoading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={17} />
                  )}

                  Generate image
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  }
