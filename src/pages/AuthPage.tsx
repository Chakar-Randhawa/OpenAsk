import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../core/context/AuthContext';
import { userService } from '../core/services/userService';

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthPage: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Form inputs
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim() || displayName.length > 50) {
          throw new Error('Please enter a display name between 1 and 50 characters.');
        }
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser.length < 3 || cleanUser.length > 30 || !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
          throw new Error('Username must be 3-30 characters with alphanumeric characters and underscores only.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!termsAccepted) {
          throw new Error('You must accept the Terms of Service and Privacy Policy to create an account.');
        }

        const isTaken = await userService.isUsernameTaken(cleanUser);
        if (isTaken) {
          throw new Error(`Username @${cleanUser} is already taken. Please choose another.`);
        }

        await signUpWithEmail(displayName, cleanUser, email.trim(), password);
        navigate(redirectPath);
      } else if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
        navigate(redirectPath);
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setResetSent(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password combination.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(redirectPath);
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xs space-y-6">
      
      {/* Brand & Header */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to OpenAsk
        </Link>

        <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'login' && 'Welcome Back'}
          {mode === 'forgot' && 'Reset Password'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {mode === 'signup' && 'Join the global community of thinkers and creators.'}
          {mode === 'login' && 'Sign in to ask, answer, follow, and contribute.'}
          {mode === 'forgot' && "Enter your email address to receive password reset instructions."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {resetSent ? (
        <div className="p-5 text-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl space-y-3 text-xs">
          <Check className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-semibold text-neutral-900 dark:text-white">Reset Email Sent</p>
          <p className="text-neutral-500">
            Check your inbox for a link to reset your password. Once updated, you can sign in with your new credentials.
          </p>
          <button
            onClick={() => { setMode('login'); setResetSent(false); }}
            className="text-xs font-semibold text-neutral-900 dark:text-white underline pt-2"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. elena_r"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
              />
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-400"
                />
                <label htmlFor="terms" className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-neutral-950 dark:text-white underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-neutral-950 dark:text-white underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
          </button>

          {/* Social Auth Separator */}
          {mode !== 'forgot' && (
            <>
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-neutral-900 text-[11px] text-neutral-400">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Switch Mode Footer */}
          <div className="text-center pt-2 text-neutral-500">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-semibold text-neutral-950 dark:text-white underline"
                >
                  Create one
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-semibold text-neutral-950 dark:text-white underline"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-semibold text-neutral-950 dark:text-white underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

        </form>
      )}

    </div>
  );
};
