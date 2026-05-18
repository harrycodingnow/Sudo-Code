"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "sudocode:chat:v1";
const MAX_HISTORY = 24;

const STARTER_MESSAGE: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Hey — I'm your SudoCode guide. Ask about a problem, request a topic recommendation, or have me explain how the tracker works. What are you in the mood for?",
};

const QUICK_PROMPTS = [
  "Where do I start as a beginner?",
  "Explain binary search at a high level",
  "How does the tracker work?",
  "Recommend a problem on hash maps",
];

function detectPage(pathname: string | null): "home" | "problems" | "tracker" | "workspace" {
  if (!pathname) return "home";
  if (pathname.startsWith("/problems/")) return "workspace";
  if (pathname === "/problems") return "problems";
  if (pathname === "/tracker") return "tracker";
  return "home";
}

function deriveProblemSlug(pathname: string | null) {
  if (!pathname?.startsWith("/problems/")) return undefined;
  return pathname.replace("/problems/", "").split("/")[0] || undefined;
}

// Render plain text with inline `code` spans and clickable backticked path tokens.
function renderInline(text: string) {
  const nodes: Array<React.ReactNode> = [];
  const regex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const inner = match[1];
    if (inner.startsWith("/")) {
      nodes.push(
        <Link key={`l-${key++}`} href={inner} className="pl-chat-link">
          <code>{inner}</code>
        </Link>,
      );
    } else {
      nodes.push(
        <code key={`c-${key++}`} className="pl-chat-code">
          {inner}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function LabChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const titleId = useId();

  // Hydrate from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_HISTORY)),
      );
    } catch {
      // ignore quota errors
    }
  }, [messages, hydrated]);

  // Autoscroll on new message / open
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const context = useMemo(
    () => ({
      page: detectPage(pathname),
      problemSlug: deriveProblemSlug(pathname),
    }),
    [pathname],
  );

  const send = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text || sending) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      const next = [...messages, userMessage];
      setMessages(next);
      setInput("");
      setError(null);
      setSending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next
              .slice(-MAX_HISTORY)
              .map(({ role, content }) => ({ role, content })),
            context,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "Chat request failed.");
        }
        setMessages((curr) => [...curr, data.message as ChatMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSending(false);
      }
    },
    [context, input, messages, sending],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void send();
    },
    [send],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void send();
      }
    },
    [send],
  );

  const reset = useCallback(() => {
    setMessages([STARTER_MESSAGE]);
    setError(null);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`pl-chat-fab${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pl-chat-fab-dot" />
        {open ? "close" : "ask guide"}
      </button>

      {open ? (
        <section
          className="pl-chat-panel"
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="false"
        >
          <header className="pl-chat-header">
            <div className="pl-chat-title-row">
              <span className="pl-chat-status-dot" />
              <h2 id={titleId} className="pl-chat-title">
                guide
                <span className="pl-chat-title-faint">~/help</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={reset}
              className="pl-chat-reset"
              aria-label="Reset conversation"
            >
              reset
            </button>
          </header>

          <div ref={listRef} className="pl-chat-list" aria-live="polite">
            {messages.map((m) => (
              <article
                key={m.id}
                className={`pl-chat-msg pl-chat-msg-${m.role}`}
              >
                <span className="pl-chat-msg-tag">
                  {m.role === "assistant" ? "guide" : "you"}
                </span>
                <p className="pl-chat-msg-body">{renderInline(m.content)}</p>
              </article>
            ))}
            {sending ? (
              <article className="pl-chat-msg pl-chat-msg-assistant">
                <span className="pl-chat-msg-tag">guide</span>
                <p className="pl-chat-msg-body pl-chat-typing">
                  <span />
                  <span />
                  <span />
                </p>
              </article>
            ) : null}
            {error ? (
              <article className="pl-chat-msg pl-chat-msg-error">
                <span className="pl-chat-msg-tag">error</span>
                <p className="pl-chat-msg-body">{error}</p>
              </article>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="pl-chat-quick">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="pl-chat-quick-btn"
                  onClick={() => void send(prompt)}
                  disabled={sending}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form className="pl-chat-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="pl-chat-input"
              placeholder="ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={sending}
            />
            <button
              type="submit"
              className="pl-chat-send"
              disabled={sending || input.trim().length === 0}
            >
              {sending ? "…" : "send"}
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
