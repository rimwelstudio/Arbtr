import React, { useState, useRef, useEffect } from 'react';
import { Scale, History, PlusCircle, BookOpen, Sun, Moon, HelpCircle, LogIn, LogOut, User as UserIcon, ChevronDown, CheckCircle2, Menu, X, Sparkles } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/i18n';
import { HumanoidIcon } from './HumanoidIcon';
import { useAuth } from '../contexts/AuthContext';
import { ArbitrEmblem, ArbitrWordmark } from './ArbitrLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  onOpenLiveVoice: () => void;
  onOpenZenaWidget?: () => void;
  onOpenAbout: () => void;
  onOpenWelcome?: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  savedCount: number;
  hasActiveDecision: boolean;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  wakeWordListening?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenPresets,
  onOpenLiveVoice,
  onOpenZenaWidget,
  onOpenAbout,
  onOpenWelcome,
  onOpenAuth,
  onOpenTerms,
  onOpenPrivacy,
  savedCount,
  hasActiveDecision,
  currentLanguage,
  onSelectLanguage,
  theme,
  onToggleTheme,
  wakeWordListening = false,
}) => {
  const t = getTranslation(currentLanguage);
  const { user, signOut, loading: authLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('#mobile-nav-toggle-btn')) {
          setMobileMenuOpen(false);
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  const userInitials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <div 
          id="app-logo-badge"
          onClick={() => {
            setMobileMenuOpen(false);
            onNewDecision();
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-neutral-950 p-1 text-white shadow-md transition-all duration-200 group-hover:scale-105 border border-neutral-800 ring-1 ring-cyan-500/20 group-hover:ring-cyan-400/40">
            <ArbitrEmblem className="h-7 w-7 sm:h-8 sm:w-8" glow={true} animated={true} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ArbitrWordmark className="text-base sm:text-lg" />
              <span className="hidden xs:inline-block rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                {t.aiEngineBadge || 'AI Engine'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAbout();
                }}
                title="Arbitr • arbitrapp.com (Click for system & domain overview)"
                className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
                <span>arbitrapp.com</span>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden sm:block">
              {t.appTagline || 'Stop overthinking. Start deciding.'}
            </p>
          </div>
        </div>

        {/* Desktop Actions Row (Visible on md and up) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          {/* Global Language Selector */}
          <LanguageSelector
            currentLanguage={currentLanguage}
            onSelectLanguage={onSelectLanguage}
          />

          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-2xs cursor-pointer min-h-[38px] min-w-[38px]"
            title={theme === 'dark' ? (t.themeLight || 'Switch to Light Mode') : (t.themeDark || 'Switch to Dark Mode')}
            aria-label={theme === 'dark' ? (t.themeLight || 'Switch to Light Mode') : (t.themeDark || 'Switch to Dark Mode')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Futuristic Interactive Particle Voice Deliberation Button with Zena */}
          <button
            id="nav-live-voice-btn"
            type="button"
            onClick={onOpenLiveVoice}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 dark:border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent dark:from-cyan-950/50 dark:via-indigo-950/40 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15 dark:hover:bg-cyan-900/40 hover:border-cyan-400 transition-all shadow-xs group cursor-pointer min-h-[38px]"
            title={t.zynoNavTitle || "Deliberate with Zena • Say 'Hey Zena' anytime or click here"}
          >
            <div className="relative flex items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full ${wakeWordListening ? 'bg-emerald-400' : 'bg-cyan-400'} opacity-60`}></span>
              <HumanoidIcon size={18} animated={true} isListening={wakeWordListening} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold tracking-tight leading-tight">{t.zynoVoiceNav || 'Zena Voice'}</span>
              <span className="hidden xl:inline text-[9px] font-mono text-cyan-600/80 dark:text-cyan-400/80 leading-none">{t.zynoWakeNav || 'Wake: "Hey Zena"'}</span>
            </div>
          </button>

          {onOpenWelcome && (
            <button
              id="nav-welcome-btn"
              type="button"
              onClick={onOpenWelcome}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[38px]"
              title={t.welcomeBannerGuideLink || 'Welcome Note & Introduction'}
            >
              <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span>{t.welcomeReopenNav || 'Intro'}</span>
            </button>
          )}

          <button
            id="nav-about-btn"
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[38px]"
            title={t.navAboutTooltip || 'Learn what Arbitr is used for and how it works'}
          >
            <HelpCircle className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span>{t.navAbout || 'About'}</span>
          </button>

          <button
            id="nav-presets-btn"
            type="button"
            onClick={onOpenPresets}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[38px]"
            title={t.navPresetsTooltip || 'Browse sample decisions'}
          >
            <BookOpen className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span>{t.navPresets || 'Sample Cases'}</span>
          </button>

          {/* History button in navigation header - only visible when logged in */}
          {user && (
            <button
              id="nav-history-btn"
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative cursor-pointer min-h-[38px]"
              title={t.navHistoryTooltip || 'Past decision history'}
            >
              <History className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <span>{t.navHistory || 'History'}</span>
              {savedCount > 0 && (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-1.5 text-[11px] font-semibold text-white dark:text-neutral-900">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Profile or Sign In Button */}
          {authLoading ? (
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="nav-user-profile-btn"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/80 p-1 sm:px-2.5 sm:py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer min-h-[38px]"
                title={user.email || 'User Account'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-6 w-6 rounded-full object-cover border border-indigo-300 dark:border-indigo-600"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-2xs">
                    {userInitials}
                  </div>
                )}
                <span className="hidden lg:inline max-w-[100px] truncate text-xs font-medium">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  id="nav-user-dropdown"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.displayName || 'Arbitr User'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                      {user.providerData?.[0]?.providerId && (
                        <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[9px] font-medium text-neutral-600 dark:text-neutral-400 shrink-0">
                          {user.providerData[0].providerId === 'google.com'
                            ? 'Google'
                            : user.providerData[0].providerId === 'apple.com'
                            ? 'Apple'
                            : user.providerData[0].providerId === 'facebook.com'
                            ? 'Facebook'
                            : 'Email'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t.syncingToCloud || 'Syncing decisions to cloud'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenHistory();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                    >
                      <History className="h-4 w-4 text-neutral-400" />
                      <span>{t.savedDecisionsCount || 'Saved Decisions'} ({savedCount})</span>
                    </button>
                    {onOpenTerms && (
                      <button
                        id="nav-user-terms-btn"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenTerms();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left font-medium"
                      >
                        <HelpCircle className="h-4 w-4 text-neutral-400 dark:text-neutral-300" />
                        <span>{t.navTerms || 'Terms & Conditions'}</span>
                      </button>
                    )}
                    {onOpenPrivacy && (
                      <button
                        id="nav-user-privacy-btn"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenPrivacy();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left font-medium"
                      >
                        <HelpCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{t.navPrivacy || 'Privacy Policy'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      id="nav-sign-out-btn"
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t.signOut || 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-sign-in-btn"
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shadow-2xs min-h-[38px]"
              title={t.signInTooltip || 'Sign in to save and sync decisions'}
            >
              <LogIn className="h-4 w-4" />
              <span>{t.signIn || 'Sign In'}</span>
            </button>
          )}

          {/* In-App PWA Install Button (Desktop & Tablet) */}
          <PWAInstallButton variant="navbar" />

          {hasActiveDecision && (
            <button
              id="nav-new-decision-btn"
              type="button"
              onClick={onNewDecision}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white dark:text-neutral-900 shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors min-h-[38px] cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-indigo-200 dark:text-indigo-700" />
              <span>{t.navNewDecision || 'New Decision'}</span>
            </button>
          )}
        </div>

        {/* Mobile Header Quick Actions & Hamburger (Visible on screens < md) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Quick PWA Install on Mobile Header */}
          <PWAInstallButton variant="compact" />

          {/* Quick Voice Access on Mobile - One Call Away Direct to Live */}
          <button
            id="mobile-nav-voice-btn"
            type="button"
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 dark:from-cyan-950/60 dark:to-indigo-950/50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 active:scale-95 transition-all shadow-2xs min-h-[44px] cursor-pointer"
            title="Call Zena • Direct Live Voice Conversation"
            aria-label="Call Zena Live Voice Conversation"
          >
            <div className="relative flex items-center justify-center">
              <span className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full ${wakeWordListening ? 'bg-emerald-400' : 'bg-cyan-400'} opacity-75`}></span>
              <HumanoidIcon size={18} animated={true} isListening={wakeWordListening} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-[11px] font-bold">Zena</span>
          </button>

          {/* Quick New Decision if active */}
          {hasActiveDecision && (
            <button
              id="mobile-nav-new-btn"
              type="button"
              onClick={onNewDecision}
              className="flex items-center justify-center rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 p-2 min-h-[44px] min-w-[44px] shadow-2xs active:scale-95 transition-transform cursor-pointer"
              title={t.navNewDecision || 'New Decision'}
              aria-label={t.navNewDecision || 'New Decision'}
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Menu Hamburger Button (44px touch target) */}
          <button
            id="mobile-nav-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-2 text-neutral-700 dark:text-neutral-200 min-h-[44px] min-w-[44px] hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop Overlay & Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-black/50 backdrop-blur-xs z-20 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            ref={mobileMenuRef}
            id="mobile-nav-drawer"
            className="relative z-30 md:hidden border-t border-neutral-200/80 dark:border-neutral-800 bg-white/98 dark:bg-neutral-950/98 backdrop-blur-xl px-4 py-4 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
          {/* User Account / Auth Section on Mobile */}
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200/70 dark:border-neutral-800">
            {authLoading ? (
              <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-9 w-9 rounded-full object-cover border border-indigo-300 dark:border-indigo-600 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                      {userInitials}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.displayName || 'Arbitr User'}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 p-2 min-h-[44px] cursor-pointer shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.signOut || 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{t.guestMode || 'Guest Mode'}</p>
                  <p className="text-[11px] text-neutral-500">{t.guestModeSubtitle || 'Sign in to sync decisions across devices'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 min-h-[44px] shadow-2xs cursor-pointer shrink-0"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t.signIn || 'Sign In'}</span>
                </button>
              </div>
            )}
          </div>

          {/* In-App PWA Install Banner for Mobile Drawer */}
          <div className="mb-2">
            <PWAInstallButton variant="mobile" />
          </div>

          {/* Mobile Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* History / Past Decisions */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors min-h-[48px] cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <History className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{t.navHistory || 'History'}</span>
                  {savedCount > 0 && (
                    <span className="text-[10px] font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-1.5 py-0.2 rounded-full">
                      {savedCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">{t.savedDecisionsCount || 'Past decisions'}</span>
              </div>
            </button>

            {/* Sample Cases */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPresets();
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-left transition-colors min-h-[48px] cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">{t.navPresets || 'Sample Cases'}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">Case library</span>
              </div>
            </button>

            {/* About Arbitr */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors min-h-[48px] cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">{t.navAbout || 'About Arbitr'}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">How it works</span>
              </div>
            </button>

            {/* Deliberate with Zena Voice - Direct Live Conversation */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLiveVoice();
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-cyan-500/30 dark:border-cyan-500/40 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100/60 text-left transition-colors min-h-[48px] cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-cyan-400 border border-neutral-800 shrink-0">
                <HumanoidIcon size={16} animated={true} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-200 block truncate">{t.zynoVoiceNav || 'Zena Voice'}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 truncate block">Direct Live Conversation</span>
              </div>
            </button>

            {/* Welcome Intro Tile in Mobile Menu */}
            {onOpenWelcome && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWelcome();
                }}
                className="col-span-2 flex items-center gap-2.5 p-3 rounded-xl border border-cyan-500/30 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent dark:from-cyan-950/40 dark:via-indigo-950/30 hover:bg-cyan-100/50 text-left transition-colors min-h-[48px] cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{t.welcomeIntroBadge || 'Welcome to Arbitr'}</span>
                    <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Guide →</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">
                    {t.welcomeIntroHeading || 'Stop Overthinking. Start Deciding.'}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Quick Settings: Language & Theme Strip */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onSelectLanguage={onSelectLanguage}
              />
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 min-h-[44px] cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-neutral-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Terms, Privacy & About Link Bar */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs px-1">
            <button
              id="mobile-nav-about-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 cursor-pointer font-semibold"
            >
              {t.navAbout || 'About Arbitr'}
            </button>
            {onOpenTerms && (
              <button
                id="mobile-nav-terms-btn"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTerms();
                }}
                className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 cursor-pointer font-semibold"
              >
                {t.navTerms || 'Terms'}
              </button>
            )}
            {onOpenPrivacy && (
              <button
                id="mobile-nav-privacy-btn"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPrivacy();
                }}
                className="text-neutral-700 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 cursor-pointer font-semibold"
              >
                {t.navPrivacy || 'Privacy'}
              </button>
            )}
          </div>

          {/* App Domain & Handle */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 px-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-cyan-600 dark:text-cyan-300 font-semibold hover:underline cursor-pointer"
              title="View system & domain overview"
            >
              arbitrapp.com
            </button>
            <span className="text-neutral-600 dark:text-neutral-300">@arbitrapp</span>
          </div>
        </div>
        </>
      )}
    </header>
  );
};
