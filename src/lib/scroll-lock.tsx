"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ScrollLockContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
}

const ScrollLockContext = createContext<ScrollLockContextType>({
  isLocked: true,
  lock: () => {},
  unlock: () => {},
});

export function useScrollLock() {
  return useContext(ScrollLockContext);
}

export function ScrollLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  return (
    <ScrollLockContext.Provider value={{ isLocked, lock, unlock }}>
      {children}
    </ScrollLockContext.Provider>
  );
}
