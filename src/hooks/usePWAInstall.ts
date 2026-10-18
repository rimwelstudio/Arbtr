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
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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

    // Listen for Chromium native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      // In Chromium, deferredPrompt can only be used once
      setDeferredPrompt(null);

      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
      setDeferredPrompt(null);
    }
    return false;
  }, [deferredPrompt]);

  const openStandaloneWindow = useCallback(() => {
    if (typeof window !== 'undefined') {
      const targetUrl = window.location.href;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isMacOS,
    isWindows,
    isIframe,
    browserName,
    deferredPrompt,
    install,
    openStandaloneWindow,
  };
}
