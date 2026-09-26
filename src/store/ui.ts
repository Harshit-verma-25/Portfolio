import { create } from "zustand";

interface UIState {
  menuOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  /** A question handed to the assistant (e.g. from the terminal) before its panel has loaded. */
  pendingQuestion: string | null;
  setMenuOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  ask: (question: string) => void;
  takePendingQuestion: () => string | null;
}

export const useUI = create<UIState>((set, get) => ({
  menuOpen: false,
  chatOpen: false,
  terminalOpen: false,
  pendingQuestion: null,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  ask: (question) => set({ pendingQuestion: question, chatOpen: true }),
  takePendingQuestion: () => {
    const q = get().pendingQuestion;
    if (q) set({ pendingQuestion: null });
    return q;
  },
}));
