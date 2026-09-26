"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import { Terminal, type TerminalData } from "./terminal";

export default function TerminalDialog({ data }: { data: TerminalData }) {
  const { terminalOpen, setTerminalOpen } = useUI();
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
