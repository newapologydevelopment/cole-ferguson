'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Preloader } from './Preloader';

const SHOW_PRELOADER = true;
// This is only an emergency escape hatch for an unexpected runtime failure.
// It must never compete with the normal frame warmup + complete ten-frame run.
const HARD_FAILSAFE_MS = 30_000;
const PRELOADER_SESSION_KEY = 'cole-ferguson:intro-seen';

type PreloaderGateContextValue = {
  preloaderDone: boolean;
};

const PreloaderGateContext = createContext<PreloaderGateContextValue>({
  preloaderDone: !SHOW_PRELOADER,
});

export const usePreloaderDone = () => useContext(PreloaderGateContext).preloaderDone;

type Props = {
  children: ReactNode;
};

export const PreloaderGate = ({ children }: Props) => {
  // Render the overlay in the server response so the page chrome cannot flash
  // before hydration decides whether this session has already seen the intro.
  const [showPreloader, setShowPreloader] = useState(SHOW_PRELOADER);
  const [preloaderDone, setPreloaderDone] = useState(!SHOW_PRELOADER);

  useLayoutEffect(() => {
    if (!SHOW_PRELOADER) return;

    try {
      if (window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === '1') {
        setShowPreloader(false);
        setPreloaderDone(true);
        return;
      }
    } catch {
      // Storage can be unavailable in strict privacy modes. In that case the
      // intro remains a harmless once-per-mount fallback.
    }
  }, []);

  useEffect(() => {
    if (!SHOW_PRELOADER || !showPreloader || preloaderDone) return;

    const timeoutId = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
      } catch {}
      setShowPreloader(false);
      setPreloaderDone(true);
    }, HARD_FAILSAFE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [preloaderDone, showPreloader]);

  const value = useMemo(
    () => ({ preloaderDone }),
    [preloaderDone]
  );

  const handleDone = useCallback(() => {
    try {
      window.sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
    } catch {}
    setShowPreloader(false);
    setPreloaderDone(true);
  }, []);

  return (
    <PreloaderGateContext.Provider value={value}>
      {SHOW_PRELOADER && showPreloader && !preloaderDone && (
        <Preloader onDone={handleDone} />
      )}
      {children}
    </PreloaderGateContext.Provider>
  );
};
