import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isIframe: boolean;
  browserName: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Samsung' | 'Brave' | 'Other';
  deferredPrompt: BeforeInstallPromptEvent | null;
  install: () => Promise<boolean>;
  openStandaloneWindow: () => void;
  copyAppUrl: () => Promise<boolean>;
}

// Module-level cache so prompts fired before component mount are never lost
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  if ((window as any).__pwaDeferredPrompt) {
    globalDeferredPrompt = (window as any).__pwaDeferredPrompt;
  }
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    (window as any).__pwaDeferredPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    if ((window as any).__pwaDeferredPrompt) {
      (window as any).__pwaDeferredPrompt = null;
    }
  });
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined') {
      return globalDeferredPrompt || (window as any).__pwaDeferredPrompt || null;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isMacOS, setIsMacOS] = useState<boolean>(false);
  const [isWindows, setIsWindows] = useState<boolean>(false);
  const [isIframe, setIsIframe] = useState<boolean>(false);
  const [browserName, setBrowserName] = useState<'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Samsung' | 'Brave' | 'Other'>('Other');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iframe environment (AI Studio preview, sandboxed frames)
    try {
      const inIframe = window.self !== window.top;
      setIsIframe(inIframe);
    } catch {
      setIsIframe(true);
    }

    // Detect standalone mode (already installed or running inside PWA wrapper)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      (typeof document !== 'undefined' && document.referrer.includes('android-app://'));
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();

    // Detect iOS devices (including iPadOS where userAgent can appear as Macintosh)
    const isIOSDevice =
      (/iphone|ipad|ipod/.test(userAgent) ||
        (userAgent.includes('macintosh') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detect Android
    const isAndroidDevice = /android/.test(userAgent);
    setIsAndroid(isAndroidDevice);

    // Detect Desktop macOS
    const isMacDevice = /macintosh|mac os x/.test(userAgent) && !isIOSDevice;
    setIsMacOS(isMacDevice);

    // Detect Windows
    const isWinDevice = /windows|win32|win64/.test(userAgent);
    setIsWindows(isWinDevice);

    // Detect Browser
    if (/edg\//.test(userAgent)) {
      setBrowserName('Edge');
    } else if (/samsungbrowser/.test(userAgent)) {
      setBrowserName('Samsung');
    } else if (/firefox|fxios/.test(userAgent)) {
      setBrowserName('Firefox');
    } else if (/chrome|crios/.test(userAgent)) {
      setBrowserName('Chrome');
    } else if (/safari/.test(userAgent) && !/chrome|crios|android/.test(userAgent)) {
      setBrowserName('Safari');
    } else {
      setBrowserName('Other');
    }

    // Check if an existing deferred prompt was already captured prior to hook mount
    const initialPrompt = globalDeferredPrompt || (window as any).__pwaDeferredPrompt || null;
    if (initialPrompt) {
      setDeferredPrompt(initialPrompt);
    }

    // Listen for Chromium native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      (window as any).__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReadyCustom = (e: Event) => {
      const custom = e as CustomEvent<BeforeInstallPromptEvent>;
      if (custom.detail) {
        globalDeferredPrompt = custom.detail;
        (window as any).__pwaDeferredPrompt = custom.detail;
        setDeferredPrompt(custom.detail);
      }
    };

    // Listen for successful install event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReadyCustom);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReadyCustom);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const promptToUse =
      deferredPrompt ||
      globalDeferredPrompt ||
      (typeof window !== 'undefined' ? (window as any).__pwaDeferredPrompt : null);

    if (!promptToUse) {
      return false;
    }
    try {
      await promptToUse.prompt();
      const choiceResult = await promptToUse.userChoice;
      // In Chromium, deferredPrompt can only be used once
      globalDeferredPrompt = null;
      if (typeof window !== 'undefined') {
        (window as any).__pwaDeferredPrompt = null;
      }
      setDeferredPrompt(null);

      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    }
    return false;
  }, [deferredPrompt]);

  const openStandaloneWindow = useCallback(() => {
    if (typeof window !== 'undefined') {
      const targetUrl = window.location.href;
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Window open restricted:', err);
      }
    }
  }, []);

  const copyAppUrl = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined') {
      try {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        return true;
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    }
    return false;
  }, []);

  return {
    isInstallable: !!deferredPrompt || !!globalDeferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isMacOS,
    isWindows,
    isIframe,
    browserName,
    deferredPrompt: deferredPrompt || globalDeferredPrompt,
    install,
    openStandaloneWindow,
    copyAppUrl,
  };
}
