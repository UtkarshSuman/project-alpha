// ============================================================================
// FEATURE: Mascot — GuideContext
// Shared state and context for the entire mascot system.
// Manages: active mode, tooltip message, tour state, chat messages.
// ============================================================================
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MascotMode, TourStep } from "./guide-config";
import { idleMessages } from "./guide-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type GuideState = {
  /** The selected behavior mode — null = not yet chosen (show intro) */
  mode: MascotMode | null;
  setMode: (m: MascotMode) => void;

  /** Whether the mascot panel is open */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  /** Context tooltip */
  tooltip: string | null;
  showTooltip: (msg: string) => void;
  hideTooltip: () => void;

  /** Idle bubble message */
  idleMessage: string;

  /** Tour state */
  tourSteps: TourStep[];
  tourStep: number;
  isTourActive: boolean;
  startTour: (steps: TourStep[]) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;

  /** Chat messages (chat mode) */
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "id">) => void;
  clearChat: () => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const GuideContext = createContext<GuideState | null>(null);

export function useGuideContext(): GuideState {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuideContext must be used inside <GuideProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
const STORAGE_KEY = "uveriq-mascot-mode";

let msgIdCounter = 0;
function nextId() {
  return `m${++msgIdCounter}`;
}

export function GuideProvider({ children }: { children: ReactNode }) {
  // Initialize mode from localStorage — lazy initializer runs once on mount,
  // client-side only (SSR: localStorage is undefined, caught by the try/catch).
  const [mode, setModeState] = useState<MascotMode | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as MascotMode | null;
      if (saved === "reactive" || saved === "guide" || saved === "chat") return saved;
    } catch {}
    return null;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [idleMessage, setIdleMessage] = useState(idleMessages[0]);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [tourStep, setTourStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotate idle messages every 12 s — setState inside the interval callback
  // is fine; the lint rule only flags synchronous body-level calls.
  useEffect(() => {
    idleTimer.current = setInterval(() => {
      setIdleMessage(idleMessages[Math.floor(Math.random() * idleMessages.length)]);
    }, 12_000);
    return () => {
      if (idleTimer.current) clearInterval(idleTimer.current);
    };
  }, []);

  const setMode = useCallback((m: MascotMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {}
    setIsOpen(true);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsTourActive(false);
  }, []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const showTooltip = useCallback((msg: string) => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(msg);
    // Auto-hide after 6 s
    tooltipTimer.current = setTimeout(() => setTooltip(null), 6_000);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(null);
  }, []);

  // Tour controls
  const startTour = useCallback((steps: TourStep[]) => {
    setTourSteps(steps);
    setTourStep(0);
    setIsTourActive(true);
    setIsOpen(false);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep((s) => {
      if (s >= tourSteps.length - 1) {
        setIsTourActive(false);
        return 0;
      }
      return s + 1;
    });
  }, [tourSteps.length]);

  const prevTourStep = useCallback(() => {
    setTourStep((s) => Math.max(0, s - 1));
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setTourStep(0);
  }, []);

  // Chat
  const addChatMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setChatMessages((prev) => [...prev, { ...msg, id: nextId() }]);
  }, []);

  const clearChat = useCallback(() => setChatMessages([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      if (idleTimer.current) clearInterval(idleTimer.current);
    };
  }, []);

  return (
    <GuideContext.Provider
      value={{
        mode,
        setMode,
        isOpen,
        open,
        close,
        toggle,
        tooltip,
        showTooltip,
        hideTooltip,
        idleMessage,
        tourSteps,
        tourStep,
        isTourActive,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        chatMessages,
        addChatMessage,
        clearChat,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
}
