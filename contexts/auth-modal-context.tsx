'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthModal } from '@/components/auth-modal';

interface AuthModalContextType {
  showAuthModal: () => void;
  hideAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

// 全局事件，用于从任何地方触发认证模态框
export const AUTH_MODAL_EVENT = 'show-auth-modal';

export function showAuthModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT));
  }
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  useEffect(() => {
    const handleShowAuth = () => show();
    window.addEventListener(AUTH_MODAL_EVENT, handleShowAuth);
    return () => window.removeEventListener(AUTH_MODAL_EVENT, handleShowAuth);
  }, []);

  return (
    <AuthModalContext.Provider value={{ showAuthModal: show, hideAuthModal: hide }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={hide} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
