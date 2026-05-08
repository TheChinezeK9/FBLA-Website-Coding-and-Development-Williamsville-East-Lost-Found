import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, UserPlus, Mail, GraduationCap, Hash, Flame, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'warping' | 'woosh' | 'done'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [studentId, setStudentId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStudentId, setForgotStudentId] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [wooshProgress, setWooshProgress] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    if (phase === 'warping') {
      const timer = window.setTimeout(() => setPhase('woosh'), 420);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'woosh') {
      let start: number | null = null;
      const DURATION = 600;
      const tick = (now: number) => {
        if (!start) start = now;
        const p = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.sqrt(1 - Math.min(p * p, 1));
        setWooshProgress(eased);
        if (p < 1) requestAnimationFrame(tick);
        else setTimeout(() => setPhase('done'), 150);
      };
      requestAnimationFrame(tick);
    }
    if (phase === 'done' && loggedInUser) {
      setTimeout(() => onLogin(loggedInUser), 200);
    }
  }, [phase, onLogin, loggedInUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup
        ? { name, email, password, grade, studentId }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setLoggedInUser(data.user);
      setPhase('warping');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setRecoveredPassword('');
    setIsForgotLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, studentId: forgotStudentId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not recover password');
      }

      setRecoveredPassword(data.password || '');
      setForgotMessage('Password found.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Could not recover password');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: 'url(/images/bg.png)' }}
    >
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.22)_62%,rgba(0,0,0,0.48)_100%)]" />
      <div className={`absolute inset-0 z-10 overflow-y-auto overflow-x-hidden px-5 py-5 transition-opacity duration-300 ${phase === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col items-center justify-center gap-4 py-3">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#ff4f45]/50 bg-black/35 shadow-[0_0_34px_rgba(255,79,69,0.32)]">
              <img
                src="/images/WElogo.png"
                alt="Williamsville East logo"
                className="h-10 w-10 object-contain"
                style={{ filter: 'contrast(1.14) saturate(1.2)' }}
              />
            </div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.52em] text-white/80">Williamsville East</p>
            <h1 className="text-3xl font-light uppercase tracking-[0.22em] text-white sm:text-5xl">
              Lost <span className="text-white/80">&amp;</span> <span className="font-medium text-[#ff4f45]">Found</span>
            </h1>
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-white/70">
              <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#ff7a2f]" />
              <span>Lost something? Start your search here.</span>
              <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#ff7a2f]" />
            </div>
          </div>

          <div className={`relative z-20 w-full max-w-[460px] rounded-[22px] border border-[#ff4f45]/55 bg-black/38 p-6 shadow-[0_0_55px_rgba(255,79,69,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-500 sm:p-7 ${isSignup || showForgot ? 'scale-[1.02]' : 'scale-100'}`}>
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center bg-transparent">
              <img src="/images/roundedlogo.png" alt="Williamsville East High School Lost & Found favicon" className="h-9 w-9 rounded-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {showForgot ? 'Recover password' : isSignup ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-white/62">
              {showForgot ? 'Use your email and student ID' : isSignup ? 'Join the community today' : 'Sign in to continue'}
            </p>
          </div>

          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <label htmlFor="forgot-email" className="sr-only">Email address</label>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                <input
                  id="forgot-email"
                className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="forgot-student-id" className="sr-only">Student ID</label>
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                <input
                  id="forgot-student-id"
                className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                  type="text"
                  placeholder="Student ID"
                  value={forgotStudentId}
                  onChange={e => setForgotStudentId(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              {forgotMessage && <p className="text-emerald-300 text-[11px] text-center font-bold">{forgotMessage}</p>}
              {recoveredPassword && <p className="text-white text-[11px] text-center font-bold">Your password: {recoveredPassword}</p>}

              <button
                type="submit"
                disabled={isForgotLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(90deg,#e51635,#ff7a2f)] py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(229,22,53,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {isForgotLoading ? 'Checking...' : 'Recover Password'}
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage('');
                  setRecoveredPassword('');
                }}
                className="w-full text-white/55 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignup && (
                <div className="relative">
                  <label htmlFor="signup-name" className="sr-only">Full Name</label>
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                  <input
                    id="signup-name"
                    className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="relative">
                <label htmlFor="auth-email" className="sr-only">Email address</label>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                <input
                  id="auth-email"
                  className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {isSignup && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label htmlFor="signup-grade" className="sr-only">Grade</label>
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                    <input
                      id="signup-grade"
                      className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                      type="text"
                      placeholder="Grade"
                      value={grade}
                      onChange={e => setGrade(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="relative flex-1">
                    <label htmlFor="signup-student-id" className="sr-only">Student ID</label>
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                    <input
                      id="signup-student-id"
                      className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                      type="text"
                      placeholder="ID #"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <label htmlFor="auth-password" className="sr-only">Password</label>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85" size={16} />
                <input
                  id="auth-password"
                  className="w-full rounded-[8px] border border-white/24 bg-black/25 py-3 pl-12 pr-4 text-white text-sm outline-none transition-all placeholder:text-white/45 focus:border-[#ff7a2f]"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isSignup && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotEmail(email);
                    setForgotStudentId('');
                    setForgotMessage('');
                    setRecoveredPassword('');
                  }}
                  className="w-full text-right text-xs font-semibold text-[#ff4f45] hover:text-[#ff7a2f] transition-colors"
                >
                  Forgot Password?
                </button>
              )}

              {error && <p className="text-red-400 text-[10px] text-center font-bold animate-shake">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(90deg,#e51635,#ff7a2f)] py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(229,22,53,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignup ? 'Create Account' : 'Sign In'}
                    {isSignup ? <UserPlus size={14} /> : <ArrowRight size={16} />}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setShowForgot(false);
                  setError(null);
                }}
                className="w-full text-white/55 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                {isSignup ? 'Already have an account? Sign In' : 'New here? Create an account'}
              </button>
            </form>
          )}
          </div>

          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-lg text-white sm:text-xl">
              <Flame size={22} className="text-[#ff4f45]" />
              <span>Find it.</span>
              <span className="text-[#ff4f45]">Claim it.</span>
              <span className="text-[#ff7a2f]">Reobtain it.</span>
            </div>
            <p className="mb-3 text-sm text-white/62">Turning lost into found, because lost shouldn’t stay lost.</p>
            <p className="flex items-center justify-center gap-2 text-xs text-white/64">
              <ShieldCheck size={16} />
              <span>Secure. Private. For Williamsville East High School students.</span>
            </p>
          </div>
        </div>
      </div>

      {phase === 'warping' && (
        <div className="absolute inset-0 z-8 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border-2 border-white/20 shadow-[0_0_60px_rgba(243,223,155,0.35),0_0_120px_rgba(255,250,244,0.16)] animate-[warpRing_0.4s_ease-out_infinite]" />
        </div>
      )}

      {(phase === 'woosh' || phase === 'done') && (
        <div
          className="absolute inset-0 z-50 bg-white pointer-events-none"
          style={{
            opacity: wooshProgress,
            transform: `scaleY(${wooshProgress})`,
            filter: `blur(${(1 - wooshProgress) * 12}px)`
          }}
        />
      )}
    </div>
  );
};
