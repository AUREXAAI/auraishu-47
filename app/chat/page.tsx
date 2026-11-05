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
  RefreshCw,
  Download,
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

const MAX_MESSAGES = 50;
const CHAT_ID = 'default';

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
    description: 'Step-by-step solutions',
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

/* CODE BLOCK */

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="a3-code-block">
      <div className="a3-code-header">
        <span>Code</span>

        <button type="button" onClick={() => void copyCode()}>
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

/* MARKDOWN */

function MessageContent({ content }: { content: string }) {
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

/* GENERATED IMAGE */

function GeneratedImage({ src }: { src: string }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <div className="a3-generated-image">
      {loading && !failed && (
        <div className="a3-image-loading">
          <Loader2 size={22} />
          <span>Loading image...</span>
        </div>
      )}

      {failed ? (
        <div className="a3-image-error">
          <AlertCircle size={18} />
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

      {!loading && !failed && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="a3-image-download"
        >
          <Download size={15} />
          Open image
        </a>
      )}
    </div>
  );
}

/* MAIN CHAT */

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool>('chat');

  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);

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

  /* LOAD FIREBASE HISTORY */

useEffect(() => {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const loadHistory = async () => {
    if (!userId) {
      setMessages([]);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);

    try {
      const snapshot = await Promise.race([
        getDoc(doc(db, 'chats', userId)),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Firebase history loading timed out.'));
          }, 10000);
        }),
      ]);

      if (cancelled) return;

      if (snapshot.exists()) {
        const stored = snapshot.data().messages;

        const validMessages: Message[] = Array.isArray(stored)
          ? stored
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
              }))
          : [];

        setMessages(validMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('History loading error:', error);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);

      if (!cancelled) {
        setHistoryLoading(false);
      }
    }
  };

  void loadHistory();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [userId]);
  
  /* SAVE FIREBASE HISTORY */

  useEffect(() => {
    if (!userId || historyLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await setDoc(
          doc(db, 'chats', userId),
          {
            messages: messages.slice(-MAX_MESSAGES),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error('History saving error:', error);
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, userId, historyLoading]);

  /* SIMPLE AUTO SCROLL */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'end',
    });
  }, [messages, sending]);

  /* URL PROMPT */

  useEffect(() => {
    const query = searchParams.get('q');
    const tool = searchParams.get('tool');

    if (tool === 'chat' || tool === 'solve' || tool === 'coding') {
      setSelectedTool(tool);
    }

    if (query) setInput(query);
  }, [searchParams]);

  /* TEXTAREA SIZE */

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  /* VOICE OUTPUT */

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speakMessage = useCallback(
    (content: string) => {
      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        setVoiceError('Voice output is not supported in this browser.');
        return;
      }

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = voiceLanguage;
      utterance.rate = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voiceLanguage, stopSpeaking],
  );

  /* VOICE INPUT */

  const startVoiceInput = () => {
    setVoiceError('');

    if (typeof window === 'undefined') return;

    const SpeechAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechAPI) {
      setVoiceError('Voice input is not supported. Try Chrome.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechAPI();

      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event) => {
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

      recognition.onerror = (event) => {
        setListening(false);

        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Try again.');
        } else {
          setVoiceError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error(error);
      setListening(false);
      setVoiceError('Could not start voice recognition.');
    }
  };

  /* SEND MESSAGE */

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
    const assistantId = createId();

    setMessages([
      ...updatedMessages,
      {
        role: 'assistant',
        content: '',
        id: assistantId,
      },
    ]);

    setInput('');
    setSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const idToken = user ? await user.getIdToken() : null;

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
          history: updatedMessages.slice(-20).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
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

      const updateAssistant = (text: string) => {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? { ...message, content: text }
              : message,
          ),
        );
      };

      const processEvent = (eventText: string) => {
        for (const line of eventText.split('\n')) {
          const trimmed = line.trim();

          if (!trimmed.startsWith('data:')) continue;

          const raw = trimmed.slice(5).trim();

          if (!raw || raw === '[DONE]') continue;

          let parsed: any;

          try {
            parsed = JSON.parse(raw);
          } catch {
            continue;
          }

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (typeof parsed.token === 'string') {
            assistantText += parsed.token;
            updateAssistant(assistantText);
          } else if (typeof parsed.content === 'string') {
            assistantText += parsed.content;
            updateAssistant(assistantText);
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const item of events) {
          processEvent(item);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (!assistantText.trim()) {
        throw new Error('The AI returned an empty response.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Chat error:', error);

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

  /* IMAGE GENERATION */

  const generateImage = () => {
    const cleanPrompt = imagePrompt.trim();

    if (!cleanPrompt || imageLoading) return;

    setImageLoading(true);
    setImageModalOpen(false);
    setImagePrompt('');

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
        content: 'Your image is being prepared. Loading may take some time.',
        id: assistantId,
      },
    ]);

    const imageUrl =
      `https://image.pollinations.ai/prompt/` +
      `${encodeURIComponent(cleanPrompt)}` +
      `?model=flux&width=1024&height=1024&nologo=true`;

    setMessages((previous) =>
      previous.map((message) =>
        message.id === assistantId
          ? { ...message, imageUrl }
          : message,
      ),
    );

    setImageLoading(false);
  };

  /* COPY */

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(id);

      window.setTimeout(() => setCopiedMessage(null), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  /* CLEAR */

  const clearChat = async () => {
    abortControllerRef.current?.abort();
    recognitionRef.current?.abort();
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
        console.error('Clear history error:', error);
      }
    }
  };

  /* KEYBOARD */

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

  /* CLEANUP */

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      abortControllerRef.current?.abort();
    };
  }, []);

  const ActiveToolIcon = activeTool?.icon || MessageSquare;

  /* UI */

  return (
    <main className="a3-page">
      <header className="a3-header">
        <div className="a3-header-left">
          <button
            type="button"
            className="a3-icon-button a3-mobile-menu"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Toggle sidebar"
          >
            <Menu size={19} />
          </button>

          <Link href="/" className="a3-brand">
            <span className="a3-brand-mark">
              <Sparkles size={19} />
            </span>

            <span className="a3-brand-name">
              AUREXA <small>AI</small>
            </span>
          </Link>
        </div>

        <div className="a3-header-center">
          <span className="a3-status-dot" />
          AI Assistant
        </div>

        <span className="a3-early-badge">EARLY ACCESS</span>
      </header>

      <div className="a3-layout">
        {sidebarOpen && (
          <button
            type="button"
            className="a3-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <aside className={`a3-sidebar ${sidebarOpen ? 'a3-sidebar-open' : ''}`}>
          <div className="a3-sidebar-top">
            <button
              type="button"
              className="a3-new-chat"
              onClick={() => void clearChat()}
            >
              <Plus size={17} />
              New chat
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
            <span className="a3-sidebar-label">WORKSPACE</span>

            {TOOL_OPTIONS.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  type="button"
                  key={tool.id}
                  className={`a3-sidebar-item ${
                    selectedTool === tool.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={17} />
                  <span>{tool.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              className="a3-sidebar-item"
              onClick={() => {
                setImageModalOpen(true);
                setSidebarOpen(false);
              }}
            >
              <ImageIcon size={17} />
              <span>Image Studio</span>
            </button>
          </div>

          <div className="a3-sidebar-section">
            <span className="a3-sidebar-label">RECENT CHAT</span>

            {messages.some((message) => message.role === 'user') ? (
              <div className="a3-sidebar-item a3-history-preview">
                <MessageSquare size={16} />
                <span>
                  {messages.find((message) => message.role === 'user')
                    ?.content.slice(0, 30)}
                </span>
              </div>
            ) : (
              <p className="a3-sidebar-empty">
                Your recent conversations appear here.
              </p>
            )}
          </div>

          <div className="a3-sidebar-bottom">
            <div className="a3-sidebar-user">
              <div className="a3-user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>

              <div className="a3-user-info">
                <strong>{user?.displayName || 'AUREXA User'}</strong>
                <small>{user?.email || 'Guest session'}</small>
              </div>
            </div>

            <button
              type="button"
              className="a3-sidebar-item a3-clear-button"
              onClick={() => void clearChat()}
            >
              <Trash2 size={16} />
              Clear conversation
            </button>
          </div>
        </aside>

        <section className="a3-main">
          <div className="a3-chat-toolbar">
            <div className="a3-chat-toolbar-left">
              <div className="a3-tool-selector-wrap">
                <button
                  type="button"
                  className="a3-tool-selector"
                  onClick={() => setToolMenuOpen((value) => !value)}
                >
                  <ActiveToolIcon size={17} />
                  <span>{activeTool?.label || 'AI Chat'}</span>
                  <ChevronDown size={15} />
                </button>

                {toolMenuOpen && (
                  <div className="a3-tool-dropdown">
                    {TOOL_OPTIONS.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          type="button"
                          key={tool.id}
                          className={selectedTool === tool.id ? 'active' : ''}
                          onClick={() => {
                            setSelectedTool(tool.id);
                            setToolMenuOpen(false);
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
                  </div>
                )}
              </div>
            </div>

            <div className="a3-chat-toolbar-right">
              <button
                type="button"
                className="a3-icon-button"
                onClick={() => setImageModalOpen(true)}
                aria-label="Open image generator"
                title="Image generation"
              >
                <ImageIcon size={18} />
              </button>

              <button
                type="button"
                className="a3-icon-button"
                onClick={() => void clearChat()}
                title="New conversation"
                aria-label="New conversation"
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          <div className="a3-messages">
            {historyLoading ? (
              <div className="a3-loading-state">
                <Loader2 size={24} />
                <span>Loading your workspace...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="a3-welcome">
                <div className="a3-welcome-icon">
                  <Sparkles size={30} />
                </div>

                <div className="a3-welcome-content">
                  <span className="a3-welcome-eyebrow">
                    INTELLIGENCE, REIMAGINED
                  </span>

                  <h1>
                    What can I help
                    <br />
                    <span>you create today?</span>
                  </h1>

                  <p>
                    Meet AUREXA AI — your multilingual assistant
                    for learning, ideas and development.
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

                  <div className="a3-upcoming-section">
                    <div className="a3-upcoming-heading">
                      <Sparkles size={15} />
                      UPCOMING FEATURES
                      <small>IN DEVELOPMENT</small>
                    </div>

                    <div className="a3-upcoming-grid">
                      <div className="a3-upcoming-card">
                        <WandSparkles size={19} />
                        <strong>Video AI</strong>
                        <p>AI-powered video creation</p>
                        <span className="a3-coming-badge">COMING SOON</span>
                      </div>

                      <div className="a3-upcoming-card">
                        <Code2 size={19} />
                        <strong>AI Editor</strong>
                        <p>Build and edit projects</p>
                        <span className="a3-coming-badge">COMING SOON</span>
                      </div>

                      <div className="a3-upcoming-card">
                        <MessageSquare size={19} />
                        <strong>AI Courses</strong>
                        <p>Learn with AI assistance</p>
                        <span className="a3-coming-badge">COMING SOON</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="a3-message-list">
                {messages.map((message, index) => {
                  const messageId = message.id || `message-${index}`;

                  return (
                    <div
                      key={messageId}
                      className={`a3-message-row ${
                        message.role === 'user'
                          ? 'a3-user-row'
                          : 'a3-assistant-row'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="a3-message-avatar">
                          <Sparkles size={16} />
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

                        {message.role === 'assistant' && message.content && (
                          <div className="a3-message-actions">
                            <button
                              type="button"
                              onClick={() =>
                                void copyMessage(message.content, messageId)
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
                              onClick={() => speakMessage(message.content)}
                              title="Read aloud"
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
                    </div>
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

          {voiceError && (
            <div className="a3-voice-error" role="alert">
              <AlertCircle size={15} />
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError('')}
                aria-label="Dismiss"
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
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

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
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`a3-voice-button ${listening ? 'active' : ''}`}
                onClick={startVoiceInput}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
                {listening ? 'Listening...' : 'Voice input'}
              </button>

              <button
                type="button"
                className={`a3-voice-button ${speaking ? 'active' : ''}`}
                onClick={stopSpeaking}
                disabled={!speaking}
              >
                {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {speaking ? 'Stop voice' : 'Voice output'}
              </button>
            </div>

            <form className="a3-composer" onSubmit={sendMessage}>
              <button
                type="button"
                className="a3-composer-action"
                onClick={() => setImageModalOpen(true)}
                title="Generate image"
                aria-label="Generate image"
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
                  title="Stop generation"
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
                  {input.trim() ? <ArrowUp size={20} /> : <Send size={18} />}
                </button>
              )}
            </form>

            <p className="a3-composer-disclaimer">
              AUREXA AI can make mistakes. Verify important information.
            </p>
          </div>
        </section>
      </div>

      {/* IMAGE MODAL */}

      {imageModalOpen && (
        <div
          className="a3-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setImageModalOpen(false);
            }
          }}
        >
          <section
            className="a3-image-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a3-image-title"
          >
            <div className="a3-modal-header">
              <div>
                <span className="a3-modal-eyebrow">
                  AUREXA CREATIVE STUDIO
                </span>
                <h2 id="a3-image-title">Create an image</h2>
                <p>Describe the image you want to create.</p>
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
                onChange={(event) => setImagePrompt(event.target.value)}
                placeholder="Example: A futuristic city at sunset, cinematic lighting..."
                rows={5}
              />

              <p className="a3-image-note">
                Image generation depends on the availability of the
                external image service.
              </p>

              <button
                type="button"
                className="a3-image-generate-button"
                disabled={!imagePrompt.trim() || imageLoading}
                onClick={generateImage}
              >
                {imageLoading ? (
                  <Loader2 size={17} />
                ) : (
                  <WandSparkles size={17} />
                )}
                Generate image
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

/* SPEECH RECOGNITION TYPES */

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
      | ((this: SpeechRecognition, event: SpeechRecognitionEvent) => any)
      | null;
    onerror:
      | ((this: SpeechRecognition, event: SpeechRecognitionErrorEvent) => any)
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
