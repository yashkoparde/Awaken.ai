import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../lib/supabase';
import { api } from '../lib/api';
import { ShieldAlert, ShieldCheck, Mail, User, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';

interface NeuralLinkProps {
  onSuccess: (user: any) => void;
}

export default function NeuralLink({ onSuccess }: NeuralLinkProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isForgotPassword) {
      if (!email) {
        setErrorMsg('Please specify your email address.');
        return;
      }
      setIsLoading(true);
      try {
        await resetPassword(email);
        setSuccessMsg('Status: Recovery link sent. Please check your email inbox to reset your password.');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to request password reset. Verify email is correct.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (isRegister && !fullName) {
      setErrorMsg('Please specify your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // Attempt PHP registration
        try {
          const phpUser = await api.register(email, password, fullName);
          setSuccessMsg('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            onSuccess(phpUser);
          }, 800);
          return;
        } catch (phpErr) {
          // Fallback to Supabase Sign Up Flow
          await signUpWithEmail(email, password, fullName);
          setSuccessMsg('Account registered. Check inbox or proceed to sign in.');
        }
      } else {
        // Sign In Flow (PHP server first, fallback to Supabase)
        try {
          const phpUser = await api.login(email, password);
          setSuccessMsg('Redirecting to your dashboard...');
          setTimeout(() => {
            onSuccess(phpUser);
          }, 800);
          return;
        } catch (phpErr) {
          const user = await signInWithEmail(email, password);
          if (user) {
            setSuccessMsg('Redirecting to your dashboard...');
            setTimeout(() => {
              onSuccess(user);
            }, 800);
          } else {
            setErrorMsg('Verify credentials and try again.');
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Your email address has not been confirmed yet. Please check your inbox (including the spam/junk folder) for the verification link to activate your profile.');
      } else if (msg.includes('invalid-credential') || msg.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password combination.');
      } else if (msg) {
        setErrorMsg(msg);
      } else {
        setErrorMsg('Failed to process authentication. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = (register: boolean) => {
    setIsRegister(register);
    setIsForgotPassword(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 font-sans text-slate-200 selection:bg-blue-500/30 selection:text-white">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-[420px] bg-slate-900 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative"
      >
        {/* Top visual underline/glow */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

        {/* Back Button for Forgot Password mode */}
        <AnimatePresence>
          {isForgotPassword && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => {
                setIsForgotPassword(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Dynamic header texts based on state */}
        <div className="mb-8 select-none">
          <div className="flex h-6 items-center gap-1.5 mb-2 font-semibold text-white tracking-tight text-lg">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            Awaken <span className="font-light text-slate-400">AI</span>
          </div>
          
          <p className="text-sm text-slate-400 mt-2">
            {isForgotPassword 
              ? "Recover access to your candidates profile database."
              : isRegister 
                ? "Register a new credentials map to access AI modules."
                : "Sign in to start your automated candidate analysis and oral resume building."}
          </p>
        </div>

        {/* Minimal Tab Selector (not visible if forgot password is active) */}
        {!isForgotPassword && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/60 mb-6 relative">
            <button
              type="button"
              onClick={() => toggleAuthMode(false)}
              className={`py-2 text-xs font-medium tracking-wide relative z-10 transition-colors ${!isRegister ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
              {!isRegister && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleAuthMode(true)}
              className={`py-2 text-xs font-medium tracking-wide relative z-10 transition-colors ${isRegister ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign Up
              {isRegister && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </button>
          </div>
        )}

        {/* Status messages with micro-animations */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-red-300 text-xs text-left"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs text-left"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main form handler */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {/* Full Name field (Register only) */}
            {isRegister && !isForgotPassword && (
              <motion.div
                key="register-fields-group"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-xs font-medium text-slate-400 block ml-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-white placeholder:text-slate-600 transition-all font-sans"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field (Always shown) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block ml-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-white placeholder:text-slate-600 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password field (Only when not in forgot password mode) */}
          <AnimatePresence>
            {!isForgotPassword && (
              <motion.div
                key="password-field-group"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="space-y-1.5 overflow-hidden"
              >
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-xs font-medium text-slate-400">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Loading...</span>
              </>
            ) : isForgotPassword ? (
              <span>Send Recovery Link</span>
            ) : isRegister ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
