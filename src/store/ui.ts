import { create } from "zustand";

type CursorVariant = "default" | "hover" | "text" | "view";

interface UIState {
  menuOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  cursor: CursorVariant;
  cursorLabel: string | null;
  /** 0 → 1 progress through the hero, drives the hero camera. */
  heroProgress: number;
  activePlanet: string | null;
  setMenuOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  setCursor: (variant: CursorVariant, label?: string | null) => void;
  setHeroProgress: (p: number) => void;
  setActivePlanet: (id: string | null) => void;
}

export const useUI = create<UIState>((set) => ({
  menuOpen: false,
  chatOpen: false,
  terminalOpen: false,
  cursor: "default",
  cursorLabel: null,
  heroProgress: 0,
  activePlanet: null,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  setCursor: (cursor, cursorLabel = null) => set({ cursor, cursorLabel }),
  setHeroProgress: (heroProgress) => set({ heroProgress }),
  setActivePlanet: (activePlanet) => set({ activePlanet }),
}));
