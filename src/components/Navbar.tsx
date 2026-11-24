import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  History,
  Plus,
  BookOpen,
  Sun,
  Moon,
  HelpCircle,
  LogIn,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Menu,
  X,
  Sparkles,
  FileText,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { ArbitrEmblem } from './ArbitrLogo';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTabId = 'studio' | 'history' | 'templates';

interface NavbarProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  onOpenLiveVoice?: () => void;
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
  hasActiveDecision: _hasActiveDecision,
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
  const [activeTab, setActiveTab] = useState<NavTabId>('studio');

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

  // Close mobile menu on resize to desktop (768px+)
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

  const navTabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode; action: () => void; count?: number }> = [
    {
      id: 'studio',
      label: 'Decision Studio',
      icon: <Scale className="h-3.5 w-3.5" />,
      action: () => {
        setActiveTab('studio');
        onNewDecision();
      },
    },
    {
      id: 'history',
      label: 'Saved History',
      icon: <History className="h-3.5 w-3.5" />,
      count: savedCount > 0 ? savedCount : undefined,
      action: () => {
        setActiveTab('history');
        onOpenHistory();
      },
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <BookOpen className="h-3.5 w-3.5" />,
      action: () => {
        setActiveTab('templates');
        onOpenPresets();
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-neutral-200/80 dark:border-white/10 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* 1. Left Zone: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            id="app-logo-badge"
            onClick={() => {
              setActiveTab('studio');
              setMobileMenuOpen(false);
              onNewDecision();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Arbitr • Algorithmic Decision Engine"
          >
            {/* Glowing rounded square logo container */}
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-950 p-1 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-500/30 ring-1 ring-cyan-500/20 group-hover:ring-cyan-400/50 group-hover:scale-105 transition-all duration-200">
              <ArbitrEmblem className="h-6 w-6 sm:h-7 sm:w-7" glow={true} animated={true} />
            </div>

            {/* Brand Title and Subtle Pill Badge */}
            <div className="flex items-center gap-2">
              <span className="tracking-tight font-bold text-neutral-950 dark:text-white text-lg sm:text-xl">
                Arbitr
              </span>
              <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-400/30 whitespace-nowrap">
                AI Decision Engine
              </span>
            </div>
          </div>
        </div>

        {/* 2. Center Zone: Portfolio-Style Segmented Navigation Pill (Desktop md+) */}
        <nav
          className="hidden md:flex items-center p-1 rounded-full bg-neutral-100/90 dark:bg-slate-900/95 border border-neutral-200/80 dark:border-white/15 shadow-inner"
          aria-label="Main Navigation"
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={tab.action}
                className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 rounded-full ${
                  isActive
                    ? 'text-cyan-950 dark:text-white font-bold'
                    : 'text-neutral-700 dark:text-slate-200 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white dark:bg-gradient-to-r dark:from-cyan-500/25 dark:to-indigo-500/25 border border-neutral-200/90 dark:border-cyan-400/40 rounded-full shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={isActive ? 'text-cyan-600 dark:text-cyan-300' : 'text-neutral-500 dark:text-slate-300'}>
                    {tab.icon}
                  </span>
                  <span className={isActive ? 'text-neutral-950 dark:text-white font-bold' : 'text-neutral-700 dark:text-slate-200 font-semibold'}>
                    {tab.label}
                  </span>
                  {tab.count !== undefined && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-neutral-900 dark:bg-cyan-400 text-white dark:text-slate-950 shadow-2xs">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 3. Right Zone: Organized Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Primary Action Button: + New Dilemma */}
          <button
            id="nav-new-decision-btn"
            type="button"
            onClick={() => {
              setActiveTab('studio');
              onNewDecision();
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer inline-flex items-center gap-1.5 active:scale-95 min-h-[36px]"
            title="Start fresh decision matrix"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">{t.navNewDecision || 'New Dilemma'}</span>
          </button>

          {/* Global Language Selector (Desktop) */}
          <div className="hidden lg:block">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onSelectLanguage={onSelectLanguage}
            />
          </div>

          {/* Dark / Light Theme Toggle (Desktop & Mobile) */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200/80 dark:border-white/15 bg-white dark:bg-slate-900 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title={theme === 'dark' ? (t.themeLight || 'Switch to Light Mode') : (t.themeDark || 'Switch to Dark Mode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* In-App PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="navbar" />
          </div>

          {/* User Profile / Sign-in Avatar Button in neat 36x36px frame */}
          {authLoading ? (
            <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="nav-user-profile-btn"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-9 w-9 rounded-full overflow-hidden border-2 border-indigo-400/50 hover:border-indigo-400 bg-slate-900 flex items-center justify-center cursor-pointer shadow-sm transition-all active:scale-95"
                title={user.email || 'User Account'}
                aria-label="User Account"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-[11px] font-bold text-white">
                    {userInitials}
                  </div>
                )}
              </button>

              {/* User Account Dropdown */}
              {showUserMenu && (
                <div
                  id="nav-user-dropdown"
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200/90 dark:border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-white/10">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {user.displayName || 'Arbitr User'}
                    </p>
                    <p className="text-[11px] text-neutral-600 dark:text-slate-300 truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t.syncingToCloud || 'Cloud sync active'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('history');
                        onOpenHistory();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    >
                      <History className="h-4 w-4 text-neutral-500 dark:text-slate-300" />
                      <span>{t.savedDecisionsCount || 'Saved Decisions'} ({savedCount})</span>
                    </button>
                    {onOpenTerms && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenTerms();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <FileText className="h-4 w-4 text-neutral-500 dark:text-slate-300" />
                        <span>{t.navTerms || 'Terms & Conditions'}</span>
                      </button>
                    )}
                    {onOpenPrivacy && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenPrivacy();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <Shield className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{t.navPrivacy || 'Privacy Policy'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-neutral-100 dark:border-white/10">
                    <button
                      id="nav-sign-out-btn"
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left font-bold"
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
              className="h-9 w-9 rounded-full border border-indigo-200 dark:border-indigo-400/40 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title={t.signIn || 'Sign In'}
              aria-label={t.signIn || 'Sign In'}
            >
              <UserIcon className="h-4 w-4" />
            </button>
          )}

          {/* Clean Mobile Hamburger Button (Screens < md) */}
          <button
            id="mobile-nav-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center h-9 w-9 rounded-full border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-2xs"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Frosted-Glass Slide-Down Drawer (md:hidden) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 md:hidden"
              aria-hidden="true"
            />
            <motion.div
              ref={mobileMenuRef}
              id="mobile-nav-drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-16 inset-x-0 z-40 md:hidden border-b border-neutral-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-950/98 backdrop-blur-2xl p-4 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto space-y-3.5"
            >
              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      tab.action();
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-cyan-400/60 bg-cyan-500/15 dark:bg-cyan-950/60 text-cyan-950 dark:text-cyan-200 font-bold shadow-xs'
                        : 'border-neutral-200 dark:border-white/10 bg-neutral-50/90 dark:bg-slate-900 text-neutral-900 dark:text-slate-100 font-semibold hover:bg-neutral-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`shrink-0 ${activeTab === tab.id ? 'text-cyan-600 dark:text-cyan-300' : 'text-neutral-500 dark:text-slate-300'}`}>{tab.icon}</span>
                    <span className="text-xs truncate">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 rounded-full bg-neutral-900 dark:bg-cyan-400 text-white dark:text-slate-950">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile In-App PWA Install */}
              <div>
                <PWAInstallButton
                  variant="mobile"
                  onInstalled={() => setMobileMenuOpen(false)}
                />
              </div>

              {/* Utility Links: About, Welcome */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAbout();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/90 dark:bg-slate-900 text-xs font-semibold text-neutral-900 dark:text-slate-100 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4 text-neutral-500 dark:text-slate-300" />
                  <span>{t.navAbout || 'About Arbitr'}</span>
                </button>

                {onOpenWelcome && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWelcome();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/90 dark:bg-slate-900 text-xs font-semibold text-neutral-900 dark:text-slate-100 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                    <span>Intro Guide</span>
                  </button>
                )}
              </div>

              {/* Mobile Language Selector */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800 dark:text-slate-100">Language:</span>
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onSelectLanguage={(lang) => {
                    onSelectLanguage(lang);
                  }}
                />
              </div>

              {/* Mobile User Profile / Auth Section */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="h-8 w-8 rounded-full object-cover border border-indigo-400"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {userInitials}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {user.displayName || 'Arbitr User'}
                        </p>
                        <p className="text-[10px] text-neutral-600 dark:text-slate-300 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 p-1 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">Guest Mode</p>
                      <p className="text-[10px] text-neutral-600 dark:text-slate-300 font-medium">Sign in to sync your decisions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="px-3 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-indigo-500"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
