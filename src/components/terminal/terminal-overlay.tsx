"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import { Terminal, type TerminalData } from "./terminal";

/** Global terminal, opened from the navbar or with the backtick (`) / Ctrl+K shortcut. */
export function TerminalOverlay({ data }: { data: TerminalData }) {
  const { terminalOpen, setTerminalOpen } = useUI();

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

  return (
    <Dialog open={terminalOpen} onOpenChange={setTerminalOpen}>
      <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none sm:p-0" hideClose>
        <DialogTitle className="sr-only">Interactive terminal</DialogTitle>
        <DialogDescription className="sr-only">Type commands like help, projects or cd contact to explore the portfolio. Press Escape to close.</DialogDescription>
        <Terminal data={data} autoFocus onExit={() => setTerminalOpen(false)} className="h-[70dvh]" />
      </DialogContent>
    </Dialog>
  );
}
