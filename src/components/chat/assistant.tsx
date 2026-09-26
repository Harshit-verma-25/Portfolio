"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useUI } from "@/store/ui";

// The panel (and its Markdown renderer) is only downloaded the first time the chat opens.
const AssistantPanel = dynamic(() => import("./assistant-panel"), { ssr: false });

export function Assistant() {
  const chatOpen = useUI((s) => s.chatOpen);
  const setChatOpen = useUI((s) => s.setChatOpen);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (chatOpen) setLoaded(true);
  }, [chatOpen]);

  return (
    <>
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          onPointerEnter={() => void import("./assistant-panel")}
          className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full border border-white/10 bg-bg-elevated/90 px-4 text-sm font-medium text-fg shadow-[0_10px_40px_-10px_rgba(99,102,241,0.7)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
          aria-label="Open AI assistant"
        >
          <Sparkles className="size-4 text-accent" /> <span className="hidden sm:inline">Ask about Harshit</span>
        </button>
      )}
      {loaded && <AssistantPanel />}
    </>
  );
}
