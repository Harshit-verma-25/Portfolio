"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Sparkles, Square, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What is Harshit building right now?", "Tell me about the Quyl architecture", "What's his strongest tech stack?", "Is he available for freelance work?"];

/** Chat panel — loaded on demand by <Assistant /> the first time the chat opens. */
export default function AssistantPanel() {
  const { chatOpen, setChatOpen, takePendingQuestion, pendingQuestion } = useUI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setChatOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;
      const next: Message[] = [...messages, { role: "user", content }];
      setMessages([...next, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);
      track("assistant_message", { length: content.length });
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next.slice(-12) }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Something went wrong." }));
          throw new Error(err.error);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...next, { role: "assistant", content: acc }]);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setMessages([...next, { role: "assistant", content: (err as Error).message || "Something went wrong." }]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, messages],
  );

  useEffect(() => {
    // Questions handed over from elsewhere (e.g. the terminal's `ask` command).
    if (!pendingQuestion || loading) return;
    const q = takePendingQuestion();
    if (q) void send(q);
  }, [pendingQuestion, loading, send, takePendingQuestion]);

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <m.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="assistant-title"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[75] flex h-[85dvh] flex-col overflow-hidden rounded-t-3xl border border-line bg-bg-elevated/95 shadow-2xl backdrop-blur-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[420px] sm:rounded-3xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 id="assistant-title" className="text-sm font-semibold">
                    Portfolio Assistant
                  </h2>
                  <p className="text-xs text-muted">Trained on Harshit&apos;s résumé, projects & experience</p>
                </div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label="Close assistant">
                <X className="size-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" data-lenis-prevent role="log" aria-live="polite">
              {messages.length === 0 && (
                <div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Hi! I can answer questions about Harshit&apos;s projects, skills, experience and availability. Try one of these:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:border-primary/50 hover:text-fg">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "user" ? "bg-primary text-white" : "bg-white/[0.05] text-zinc-200")}>
                    {m.role === "assistant" ? (
                      m.content ? (
                        <div className="prose-portfolio text-sm [&_p]:my-1.5 [&_ul]:my-1.5">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="flex gap-1 py-1" aria-label="Thinking">
                          {[0, 1, 2].map((d) => (
                            <span key={d} className="size-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${d * 120}ms` }} />
                          ))}
                        </span>
                      )
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-white/[0.03] p-2 focus-within:border-primary/60">
                <label htmlFor="assistant-input" className="sr-only">
                  Ask a question
                </label>
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={2000}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Ask anything about Harshit…"
                  className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted/60"
                />
                {loading ? (
                  <button type="button" onClick={() => abortRef.current?.abort()} className="grid size-9 place-items-center rounded-xl bg-white/10" aria-label="Stop generating">
                    <Square className="size-3.5" />
                  </button>
                ) : (
                  <button type="submit" disabled={!input.trim()} className="grid size-9 place-items-center rounded-xl bg-white text-bg transition disabled:opacity-30" aria-label="Send">
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 px-1 text-[10px] text-muted">AI answers can be imperfect — verify important details via the contact page.</p>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
