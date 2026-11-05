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
  KeyboardEvent,
} from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Plus,
  Menu,
  X,
  MessageSquare,
  Code2,
  Calculator,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronDown,
  Trash2,
  StopCircle,
  WandSparkles,
  AlertCircle,
  ArrowUp,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Download,
  Monitor,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import './chat-3d.css';

type Role = 'user' | 'assistant';

type Tool = 'chat' | 'solve' | 'coding';

type VoiceLanguage = 'en-IN' | 'hi-IN' | 'kn-IN';

type Message = {
  role: Role;
  content: string;
  imageUrl?: string;
  error?: boolean;
  id?: string;
};

const CHAT_ID = 'default';
const MAX_MESSAGES = 50;

const VOICE_LANGUAGES: {
  label: string;
  value: VoiceLanguage;
}[] = [
  { label: 'English', value: 'en-IN' },
  { label: 'ಕನ್ನಡ', value: 'kn-IN' },
  { label: 'हिन्दी', value: 'hi-IN' },
];

const TOOL_OPTIONS: {
  id: Tool;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}[] = [
  {
    id: 'chat',
    label: 'AI Chat',
    description: 'Ask anything',
    icon: MessageSquare,
  },
  {
    id: 'solve',
    label: 'AI Solver',
    description: 'Solve step by step',
    icon: Calculator,
  },
  {
    id: 'coding',
    label: 'Coding',
    description: 'Write and explain code',
    icon: Code2,
  },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ---------------- CODE BLOCK ---------------- */

function CodeBlock({
  children,
}: {
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="a3-code-block">
      <div className="a3-code-header">
        <span>Code</span>

        <button onClick={copyCode} type="button">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ---------------- MARKDOWN MESSAGE ---------------- */

function MessageContent({
  content,
}: {
  content: string;
}) {
  return (
    <div className="a3-message-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children, className, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');

            if (match) {
              return <CodeBlock>{code}</CodeBlock>;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ---------------- ORB ---------------- */

function OrbScene() {
  return (
    <div className="a3-orb-scene">
      <motion.div
        className="a3-orb"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 4, -4, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="a3-orb-core" />
        <div className="a3-orb-ring a3-orb-ring-one" />
        <div className="a3-orb-ring a3-orb-ring-two" />
        <div className="a3-orb-glow" />
      </motion.div>
    </div>
  );
}

/* ---------------- IMAGE MESSAGE ---------------- */

function GeneratedImage({
  src,
}: {
  src: string;
}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <div className="a3-generated-image">
      {loading && !failed && (
        <div className="a3-image-loading">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading generated image...</span>
        </div>
      )}

      {failed ? (
        <div className="a3-image-error">
          <AlertCircle size={20} />
          <span>Image could not be loaded. Please try again.</span>
        </div>
      ) : (
        <img
          src={src}
          alt="AI generated image"
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}

      {!failed && !loading && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          download="aurexa-generated-image"
          className="a3-image-download"
        >
          <Download size={15} />
          Open image
        </a>
      )}
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const [selectedTool, setSelectedTool] = useState<Tool>('chat');

  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const [voiceLanguage, setVoiceLanguage] =
    useState<VoiceLanguage>('en-IN');

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const userId = user?.uid;

  const activeTool = useMemo(
    () => TOOL_OPTIONS.find((tool) => tool.id === selectedTool),
    [selectedTool],
  );

  /* ---------------- FIRESTORE HISTORY ---------------- */

  useEffect(() => {
    if (!userId) {
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);

        const chatRef = doc(db, 'chats', userId);
        const snapshot = await getDoc(chatRef);

        if (!snapshot.exists() || cancelled) {
          return;
        }

        const data = snapshot.data();
        const storedMessages = Array.isArray(data.messages)
          ? data.messages
          : [];

        const validMessages: Message[] = storedMessages
          .filter(
            (message: any) =>
              (message.role === 'user' ||
                message.role === 'assistant') &&
              typeof message.content === 'string',
          )
          .slice(-MAX_MESSAGES)
          .map((message: any) => ({
            role: message.role,
            content: message.content,
            imageUrl:
              typeof message.imageUrl === 'string'
                ? message.imageUrl
                : undefined,
          }));

        if (!cancelled) {
          setMessages(validMessages);
        }
      } catch (error) {
        console.error('Chat history load error:', error);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ---------------- SAVE HISTORY ---------------- */

  useEffect(() => {
    if (!userId || historyLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const chatRef = doc(db, 'chats', userId);

        await setDoc(
          chatRef,
          {
            messages: messages.slice(-MAX_MESSAGES),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error('Chat history save error:', error);
      }
    }, 900);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, userId, historyLoading]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, sending]);

  /* ---------------- QUERY PROMPT ---------------- */

  useEffect(() => {
    const query = searchParams.get('q');
    const tool = searchParams.get('tool');

    if (tool === 'chat' || tool === 'solve' || tool === 'coding') {
      setSelectedTool(tool);
    }

    if (query) {
      setInput(query);
    }
  }, [searchParams]);

  /* ---------------- TEXTAREA RESIZE ---------------- */

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  /* ---------------- STOP SPEECH ---------------- */

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  /* ---------------- SPEAK MESSAGE ---------------- */

  const speakMessage = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceError('Voice output is not supported in this browser.');
        return;
      }

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLanguage;
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voiceLanguage, stopSpeaking],
  );

  /* ---------------- VOICE INPUT ---------------- */

  const startVoiceInput = () => {
    setVoiceError('');

    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceError(
        'Speech recognition is not supported in this browser. Try Chrome.',
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();

      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';

        for (
          let index = event.resultIndex;
          index < event.results.length;
          index += 1
        ) {
          transcript += event.results[index][0].transcript;
        }

        setInput(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setListening(false);

        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try again.');
        } else {
          setVoiceError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Voice recognition error:', error);
      setListening(false);
      setVoiceError('Could not start voice recognition.');
    }
  };

  /* ---------------- SEND CHAT ---------------- */

  const sendMessage = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

    const cleanInput = input.trim();

    if (!cleanInput || sending) return;

    setErrorMessage('');
    setVoiceError('');

    const userMessage: Message = {
      role: 'user',
      content: cleanInput,
      id: createId(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const assistantId = createId();

    setMessages((previous) => [
      ...previous,
      {
        role: 'assistant',
        content: '',
        id: assistantId,
      },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const idToken = user
        ? await user.getIdToken()
        : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken
            ? { Authorization: `Bearer ${idToken}` }
            : {}),
        },
        body: JSON.stringify({
          idToken,
          tool: selectedTool,
          chatId: CHAT_ID,
          message: cleanInput,
          history: updatedMessages
            .slice(-20)
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (
          response.status === 429 ||
          errorData?.code === 'LIMIT_REACHED'
        ) {
          throw new Error(
            errorData?.message ||
              'You have reached the current usage limit.',
          );
        }

        throw new Error(
          errorData?.error ||
            errorData?.message ||
            `Request failed (${response.status})`,
        );
      }

      if (!response.body) {
        throw new Error('The server returned an empty response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let assistantText = '';

      const processSSE = (chunk: string) => {
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith('data:')) continue;

          const rawData = trimmed.slice(5).trim();

          if (!rawData || rawData === '[DONE]') continue;

          try {
            const parsed = JSON.parse(rawData);

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.token) {
              assistantText += parsed.token;

              setMessages((previous) =>
                previous.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content: assistantText,
                      }
                    : message,
                ),
              );
            }

            if (parsed.content) {
              assistantText += parsed.content;

              setMessages((previous) =>
                previous.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content: assistantText,
                      }
                    : message,
                ),
              );
            }
          } catch (error) {
            if (error instanceof SyntaxError) {
              continue;
            }

            throw error;
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          processSSE(chunk);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processSSE(buffer);
      }

      if (!assistantText.trim()) {
        throw new Error(
          'The AI returned an empty response. Please try again.',
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        return;
      }

      console.error('Chat request error:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';

      setErrorMessage(message);

      setMessages((previous) =>
        previous.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: `Sorry, I couldn't complete that request.\n\n${message}`,
                error: true,
              }
            : item,
        ),
      );
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  };

  /* ---------------- IMAGE GENERATION ---------------- */

  const generateImage = async () => {
    const cleanPrompt = imagePrompt.trim();

    if (!cleanPrompt || imageLoading) return;

    setImageLoading(true);
    setImageModalOpen(false);
    setImagePrompt('');
    setErrorMessage('');

    const userMessage: Message = {
      role: 'user',
      content: `Generate an image: ${cleanPrompt}`,
      id: createId(),
    };

    const assistantId = createId();

    setMessages((previous) => [
      ...previous,
      userMessage,
      {
        role: 'assistant',
        content: `Creating an image for: "${cleanPrompt}"`,
        id: assistantId,
      },
    ]);

    try {
      const imageUrl =
        `https://image.pollinations.ai/prompt/` +
        `${encodeURIComponent(cleanPrompt)}` +
        `?model=flux&width=1024&height=1024&nologo=true`;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: 'Your image is ready to load.',
                imageUrl,
              }
            : message,
        ),
      );
    } catch (error) {
      console.error('Image generation error:', error);

      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  'Image generation could not be started. Please try again.',
                error: true,
              }
            : message,
        ),
      );
    } finally {
      setImageLoading(false);
    }
  };

  /* ---------------- COPY MESSAGE ---------------- */

  const copyMessage = async (
    content: string,
    id: string,
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(id);

      setTimeout(() => {
        setCopiedMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  /* ---------------- CLEAR CHAT ---------------- */

  const clearChat = async () => {
    abortControllerRef.current?.abort();
    stopSpeaking();

    setMessages([]);
    setErrorMessage('');
    setSidebarOpen(false);

    if (userId) {
      try {
        await setDoc(
          doc(db, 'chats', userId),
          {
            messages: [],
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error('Could not clear saved chat:', error);
      }
    }
  };

  /* ---------------- KEYBOARD ---------------- */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setSending(false);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <main className="a3-page">
      {/* HEADER */}

      <header className="a3-header">
        <div className="a3-header-left">
          <button
            type="button"
            className="a3-icon-button a3-mobile-menu"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="a3-brand">
            <span className="a3-brand-mark">
              <Sparkles size={20} />
            </span>

            <span>
              <strong>AUREXA</strong>
              <small>AI</small>
            </span>
          </Link>
        </div>

        <div className="a3-header-center">
          <span className="a3-status-dot" />
          <span>AI Assistant</span>
        </div>

        <div className="a3-header-right">
          <span className="a3-early-badge">
            EARLY ACCESS
          </span>
        </div>
      </header>

      <div className="a3-layout">
        {/* SIDEBAR */}

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="a3-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`a3-sidebar ${
            sidebarOpen ? 'a3-sidebar-open' : ''
          }`}
        >
          <div className="a3-sidebar-top">
            <button
              type="button"
              className="a3-new-chat"
              onClick={() => {
                void clearChat();
              }}
            >
              <Plus size={17} />
              <span>New chat</span>
            </button>

            <button
              type="button"
              className="a3-icon-button a3-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="a3-sidebar-section">
            <span className="a3-sidebar-label">
              WORKSPACE
            </span>

            <button
              type="button"
              className="a3-sidebar-item active"
            >
              <MessageSquare size={17} />
              <span>AI Chat</span>
            </button>

            <button
              type="button"
              className="a3-sidebar-item"
              onClick={() => setImageModalOpen(true)}
            >
              <ImageIcon size={17} />
              <span>Image Studio</span>
            </button>
          </div>

          <div className="a3-sidebar-section">
            <span className="a3-sidebar-label">
              RECENT
            </span>

            {messages.length > 0 ? (
              <div className="a3-sidebar-history">
                <button
                  type="button"
                  className="a3-sidebar-item"
                >
                  <MessageSquare size={16} />
                  <span>
                    {messages.find((message) => message.role === 'user')
                      ?.content.slice(0, 26) || 'Current conversation'}
                  </span>
                </button>
              </div>
            ) : (
              <p className="a3-sidebar-empty">
                Your conversations will appear here.
              </p>
            )}
          </div>

          <div className="a3-sidebar-bottom">
            <div className="a3-sidebar-user">
              <div className="a3-user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>

              <div className="a3-user-info">
                <strong>
                  {user?.displayName || 'AUREXA User'}
                </strong>
                <small>
                  {user?.email || 'Guest session'}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="a3-sidebar-item a3-clear-button"
              onClick={() => void clearChat()}
            >
              <Trash2 size={16} />
              <span>Clear conversation</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <section className="a3-main">
          <div className="a3-chat-toolbar">
            <div className="a3-chat-toolbar-left">
              <button
                type="button"
                className="a3-icon-button a3-desktop-sidebar-toggle"
                onClick={() => setSidebarOpen((value) => !value)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <PanelLeftClose size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
              </button>

              <div className="a3-tool-selector-wrap">
                <button
                  type="button"
                  className="a3-tool-selector"
                  onClick={() => setMobileToolsOpen((value) => !value)}
                >
                  {activeTool && <activeTool.icon size={17} />}
                  <span>{activeTool?.label || 'AI Chat'}</span>
                  <ChevronDown size={15} />
                </button>

                <AnimatePresence>
                  {mobileToolsOpen && (
                    <motion.div
                      className="a3-tool-dropdown"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      {TOOL_OPTIONS.map((tool) => {
                        const Icon = tool.icon;

                        return (
                          <button
                            type="button"
                            key={tool.id}
                            className={
                              selectedTool === tool.id
                                ? 'active'
                                : ''
                            }
                            onClick={() => {
                              setSelectedTool(tool.id);
                              setMobileToolsOpen(false);
                            }}
                          >
                            <Icon size={17} />

                            <span>
                              <strong>{tool.label}</strong>
                              <small>{tool.description}</small>
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="a3-chat-toolbar-right">
              <button
                type="button"
                className="a3-icon-button"
                onClick={() => setImageModalOpen(true)}
                title="Image generation"
              >
                <ImageIcon size={18} />
              </button>

              <button
                type="button"
                className="a3-icon-button"
                onClick={() => void clearChat()}
                title="New conversation"
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="a3-messages">
            {historyLoading ? (
              <div className="a3-loading-state">
                <Loader2 size={25} className="animate-spin" />
                <span>Loading your workspace...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="a3-welcome">
                <OrbScene />

                <motion.div
                  className="a3-welcome-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="a3-welcome-eyebrow">
                    INTELLIGENCE, REIMAGINED
                  </span>

                  <h1>
                    What can I help
                    <br />
                    <span>you create today?</span>
                  </h1>

                  <p>
                    Meet AUREXA AI — your multilingual AI
                    assistant for ideas, learning, creativity
                    and development.
                  </p>

                  <div className="a3-tool-grid">
                    {TOOL_OPTIONS.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          type="button"
                          key={tool.id}
                          className={`a3-tool-card ${
                            selectedTool === tool.id ? 'active' : ''
                          }`}
                          onClick={() => setSelectedTool(tool.id)}
                        >
                          <span className="a3-tool-card-icon">
                            <Icon size={20} />
                          </span>

                          <strong>{tool.label}</strong>
                          <small>{tool.description}</small>
                        </button>
                      );
                    })}
                  </div>

                  <div className="a3-upcoming-nav">
                    <span>EXPLORE AUREXA</span>
                  </div>

                  <div className="a3-upcoming-grid">
                    <div className="a3-upcoming-card">
                      <ImageIcon size={19} />
                      <strong>AI Images</strong>
                      <small>Generate visuals from prompts</small>
                    </div>

                    <div className="a3-upcoming-card">
                      <WandSparkles size={19} />
                      <strong>Video AI</strong>
                      <small>Coming soon</small>
                      <span className="a3-coming-badge">SOON</span>
                    </div>

                    <div className="a3-upcoming-card">
                      <Monitor size={19} />
                      <strong>Screen Assistance</strong>
                      <small>Coming soon</small>
                      <span className="a3-coming-badge">SOON</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="a3-message-list">
                {messages.map((message, index) => {
                  const messageId =
                    message.id || `message-${index}`;

                  return (
                    <motion.div
                      key={messageId}
                      className={`a3-message-row ${
                        message.role === 'user'
                          ? 'a3-user-row'
                          : 'a3-assistant-row'
                      }`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {message.role === 'assistant' && (
                        <div className="a3-message-avatar">
                          <Sparkles size={17} />
                        </div>
                      )}

                      <div
                        className={`a3-message-bubble ${
                          message.role === 'user'
                            ? 'a3-user-message'
                            : 'a3-assistant-message'
                        } ${message.error ? 'a3-message-error' : ''}`}
                      >
                        {message.role === 'assistant' ? (
                          <>
                            {message.content && (
                              <MessageContent content={message.content} />
                            )}

                            {message.imageUrl && (
                              <GeneratedImage src={message.imageUrl} />
                            )}
                          </>
                        ) : (
                          <p>{message.content}</p>
                        )}

                        {message.role === 'assistant' &&
                          message.content && (
                            <div className="a3-message-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  void copyMessage(
                                    message.content,
                                    messageId,
                                  )
                                }
                                title="Copy response"
                              >
                                {copiedMessage === messageId ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  speakMessage(message.content)
                                }
                                title="Read response aloud"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                          )}
                      </div>

                      {message.role === 'user' && (
                        <div className="a3-user-message-avatar">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {sending && (
                  <div className="a3-typing-indicator">
                    <span />
                    <span />
                    <span />
                    <small>AUREXA is thinking</small>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* VOICE ERROR */}

          {voiceError && (
            <div className="a3-voice-error" role="alert">
              <AlertCircle size={15} />
              <span>{voiceError}</span>

              <button
                type="button"
                onClick={() => setVoiceError('')}
                aria-label="Dismiss voice error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="a3-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>

              <button
                type="button"
                onClick={() => setErrorMessage('')}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* COMPOSER */}

          <div className="a3-composer-wrap">
            <div className="a3-voice-controls">
              <select
                className="a3-voice-language"
                value={voiceLanguage}
                onChange={(event) =>
                  setVoiceLanguage(event.target.value as VoiceLanguage)
                }
                aria-label="Voice language"
              >
                {VOICE_LANGUAGES.map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                  >
                    {language.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`a3-voice-button ${
                  listening ? 'active' : ''
                }`}
                onClick={startVoiceInput}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                {listening ? (
                  <MicOff size={17} />
                ) : (
                  <Mic size={17} />
                )}
                <span>{listening ? 'Listening...' : 'Voice input'}</span>
              </button>

              <button
                type="button"
                className={`a3-voice-button ${
                  speaking ? 'active' : ''
                }`}
                onClick={speaking ? stopSpeaking : undefined}
                disabled={!speaking}
                title="Stop voice output"
              >
                {speaking ? (
                  <VolumeX size={17} />
                ) : (
                  <Volume2 size={17} />
                )}
                <span>{speaking ? 'Stop voice' : 'Voice output'}</span>
              </button>
            </div>

            <form
              className="a3-composer"
              onSubmit={sendMessage}
            >
              <button
                type="button"
                className="a3-composer-action"
                onClick={() => setImageModalOpen(true)}
                title="Generate image"
              >
                <ImageIcon size={19} />
              </button>

              <textarea
                ref={textareaRef}
                className="a3-composer-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedTool === 'solve'
                    ? 'Ask AUREXA to solve a problem...'
                    : selectedTool === 'coding'
                      ? 'Describe what you want to code...'
                      : 'Message AUREXA AI...'
                }
                rows={1}
                disabled={sending}
              />

              {sending ? (
                <button
                  type="button"
                  className="a3-send-button"
                  onClick={stopGeneration}
                  title="Stop generating"
                >
                  <StopCircle size={19} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="a3-send-button"
                  disabled={!input.trim()}
                  title="Send message"
                >
                  {input.trim() ? (
                    <ArrowUp size={20} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              )}
            </form>

            <p className="a3-composer-disclaimer">
              AUREXA AI can make mistakes. Verify important information.
            </p>
          </div>
        </section>
      </div>

      {/* IMAGE GENERATION MODAL */}

      <AnimatePresence>
        {imageModalOpen && (
          <motion.div
            className="a3-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setImageModalOpen(false);
              }
            }}
          >
            <motion.div
              className="a3-image-modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="a3-image-title"
            >
              <div className="a3-modal-header">
                <div>
                  <span className="a3-modal-eyebrow">
                    AUREXA CREATIVE STUDIO
                  </span>

                  <h2 id="a3-image-title">
                    Create an image
                  </h2>

                  <p>
                    Turn your imagination into a visual.
                  </p>
                </div>

                <button
                  type="button"
                  className="a3-icon-button"
                  onClick={() => setImageModalOpen(false)}
                  aria-label="Close image generator"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="a3-image-form">
                <label htmlFor="a3-image-prompt">
                  Describe your image
                </label>

                <textarea
                  id="a3-image-prompt"
                  className="a3-image-textarea"
                  value={imagePrompt}
                  onChange={(event) =>
                    setImagePrompt(event.target.value)
                  }
                  placeholder="Example: A futuristic golden city at sunset, cinematic lighting, ultra detailed..."
                  rows={5}
                  autoFocus
                />

                <div className="a3-image-prompt-hint">
                  Be descriptive for better results.
                </div>

                <button
                  type="button"
                  className="a3-image-generate-button"
                  disabled={!imagePrompt.trim() || imageLoading}
                  onClick={() => void generateImage()}
                >
                  {imageLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <WandSparkles size={18} />
                      Generate image
                    </>
                  )}
                </button>

                <p className="a3-image-disclaimer">
                  Image generation uses an external image service.
                  Availability and loading time may vary.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---------------- SPEECH RECOGNITION TYPES ---------------- */

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    start(): void;
    stop(): void;
    abort(): void;

    onstart: ((this: SpeechRecognition, event: Event) => any) | null;

    onresult:
      | ((
          this: SpeechRecognition,
          event: SpeechRecognitionEvent,
        ) => any)
      | null;

    onerror:
      | ((
          this: SpeechRecognition,
          event: SpeechRecognitionErrorEvent,
        ) => any)
      | null;

    onend: ((this: SpeechRecognition, event: Event) => any) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}
