"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUI } from "@/store/ui";
import type { TerminalData } from "./terminal";

// The dialog and terminal only download the first time the terminal is opened.
const TerminalDialog = dynamic(() => import("./terminal-dialog"), { ssr: false });

/** Global terminal, opened from the navbar or with the backtick (`) / Ctrl+K shortcut. */
export function TerminalOverlay({ data }: { data: TerminalData }) {
  const terminalOpen = useUI((s) => s.terminalOpen);
  const setTerminalOpen = useUI((s) => s.setTerminalOpen);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (terminalOpen) setLoaded(true);
  }, [terminalOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, [contenteditable='true']");
      if ((e.key === "`" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setTerminalOpen(!useUI.getState().terminalOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTerminalOpen]);

  return loaded ? <TerminalDialog data={data} /> : null;
}
