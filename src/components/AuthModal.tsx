import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../utils/i18n';
import { ArbitrEmblem } from './ArbitrLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  promptReason?: string;
  onSuccess?: () => void;
  currentLanguage?: string;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  promptReason,
  onSuccess,
  currentLanguage,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();
  const t = getTranslation(currentLanguage);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email. Would you like to create one?';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify and try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email using a different sign-in method. Please sign in with your original provider.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled. The window was closed before completion.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'auth/cancelled-popup-request':
        return 'The sign-in request was cancelled. Please try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in provider is not enabled in your Firebase project. Please ensure Google, Apple, or Facebook is enabled in the Firebase Console.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth operations in Firebase. Please add this domain to the authorized domains list in Firebase Console.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Access to this account has been temporarily disabled. Please try again later.';
      default:
        return error?.message || 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithApple();
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithFacebook();
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        handleClose();
        if (onSuccess) onSuccess();
      } else if (mode === 'signup') {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUpWithEmail(email, password, displayName || undefined);
        handleClose();
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your email inbox.');
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 p-1 text-white shadow-md border border-neutral-800 ring-1 ring-cyan-500/20">
              <ArbitrEmblem className="h-8 w-8" glow={true} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base leading-tight">
                {mode === 'signin' && (t.authSignInTitle || 'Sign in to Arbitr')}
                {mode === 'signup' && (t.authSignUpTitle || 'Create your Arbitr Account')}
                {mode === 'forgot' && (t.authForgotTitle || 'Reset your Password')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {mode === 'forgot'
                  ? (t.authForgotDesc || 'We will send a reset link to your email')
                  : (t.authSyncDesc || 'Access and sync your saved decisions across devices')}
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prompt banner if triggered by saving a decision */}
        {promptReason && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex items-start gap-2.5">
            <BookmarkCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200">
              <span className="font-semibold block">{t.authRequired || 'Authentication Required'}</span>
              {promptReason}
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Social Sign In Providers */}
          {mode !== 'forgot' && (
            <>
              <div className="space-y-2.5">
                {/* Google Sign In Button */}
                <button
                  id="auth-google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 text-neutral-800 dark:text-neutral-100 font-medium text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t.authContinueWithGoogle || 'Continue with Google'}</span>
                </button>

                {/* Apple Sign In Button */}
                <button
                  id="auth-apple-signin-btn"
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-900 dark:border-neutral-700 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.92-3.26-7.84-8-11.77-14.22-5.99-9.46-10.74-20.2-14.26-32.22-3.52-12.02-5.28-23.47-5.28-34.35 0-14.35 3.58-26.41 10.74-36.19 7.16-9.78 16.32-14.77 27.48-14.99 4.35 0 9.28 1.14 14.79 3.42 5.51 2.28 9.28 3.48 11.3 3.59 1.8 0 5.68-1.25 11.64-3.75 5.96-2.5 11.13-3.64 15.52-3.42 12.3.65 22.09 5.38 29.37 14.19-10.88 6.64-16.1 15.99-15.66 28.06.44 9.57 4.14 17.58 11.1 24.04 6.96 6.46 15.22 10.12 24.79 10.99-2.18 6.74-4.89 13.43-8.14 20.08zM119.22 31.84c0-7.39 2.66-14.24 7.98-20.55 5.32-6.31 11.85-10.22 19.59-11.29.22 1.3.33 2.39.33 3.26 0 7.39-2.77 14.46-8.31 21.21-5.54 6.75-12.23 10.55-20.08 11.42-.33-1.31-.51-2.66-.51-4.05z" />
                  </svg>
                  <span>{t.authContinueWithApple || 'Continue with Apple'}</span>
                </button>

                {/* Facebook Sign In Button */}
                <button
                  id="auth-facebook-signin-btn"
                  type="button"
                  onClick={handleFacebookSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 text-neutral-800 dark:text-neutral-100 font-medium text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{t.authContinueWithFacebook || 'Continue with Facebook'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                  {t.authOrWithEmail || 'Or with Email'}
                </span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
              </div>
            </>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.authFullNameLabel || 'Full Name (Optional)'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="auth-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-neutral-50 dark:bg-slate-900/90 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.authEmailLabel || 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-neutral-50 dark:bg-slate-900/90 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {t.authPasswordLabel || 'Password'}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {t.authForgotPassword || 'Forgot?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-neutral-50 dark:bg-slate-900/90 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs disabled:opacity-60 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>{t.loadingStatus || 'Please wait...'}</span>
              ) : mode === 'signin' ? (
                <span>{t.authSignInBtn || 'Sign In'}</span>
              ) : mode === 'signup' ? (
                <span>{t.authSignUpBtn || 'Create Account'}</span>
              ) : (
                <span>{t.authSendResetBtn || 'Send Reset Link'}</span>
              )}
            </button>
          </form>

          {/* Footer toggle mode */}
          <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
            {mode === 'signin' && (
              <span>
                {t.authNeedAccount || "Don't have an account yet?"}{' '}
                <button
                  id="auth-switch-to-signup-btn"
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t.authSignUpBtn || 'Sign up'}
                </button>
              </span>
            )}
            {mode === 'signup' && (
              <span>
                {t.authAlreadyHaveAccount || 'Already have an account?'}{' '}
                <button
                  id="auth-switch-to-signin-btn"
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t.authSignInBtn || 'Sign in'}
                </button>
              </span>
            )}
            {mode === 'forgot' && (
              <span>
                {t.authBackToSignIn || 'Remembered your password?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t.authBackToSignIn || 'Back to sign in'}
                </button>
              </span>
            )}

            {/* Terms and Privacy Acceptance Links */}
            {(onOpenTerms || onOpenPrivacy) && (
              <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                By continuing, you agree to Arbitr's{' '}
                {onOpenTerms && (
                  <button
                    id="auth-terms-link-btn"
                    type="button"
                    onClick={() => {
                      handleClose();
                      onOpenTerms();
                    }}
                    className="text-indigo-600 dark:text-indigo-300 hover:underline font-semibold cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                )}
                {onOpenTerms && onOpenPrivacy && ' and '}
                {onOpenPrivacy && (
                  <button
                    id="auth-privacy-link-btn"
                    type="button"
                    onClick={() => {
                      handleClose();
                      onOpenPrivacy();
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                )}
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
