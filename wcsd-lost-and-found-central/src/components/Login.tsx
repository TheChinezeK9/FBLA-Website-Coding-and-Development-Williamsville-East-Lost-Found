import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, LogIn, UserPlus, Mail, GraduationCap, Hash } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const BRAND_STARS = [
  { top: '10%', left: '12%', size: 5, color: '#fffaf4', opacity: 0.84, delay: '0s' },
  { top: '18%', left: '72%', size: 4, color: '#f3df9b', opacity: 0.78, delay: '0.6s' },
  { top: '24%', left: '35%', size: 3, color: '#e7a39b', opacity: 0.74, delay: '1.1s' },
  { top: '32%', left: '82%', size: 6, color: '#fffaf4', opacity: 0.68, delay: '1.7s' },
  { top: '43%', left: '18%', size: 4, color: '#f3df9b', opacity: 0.82, delay: '0.3s' },
  { top: '52%', left: '68%', size: 3, color: '#e7a39b', opacity: 0.78, delay: '1.4s' },
  { top: '62%', left: '28%', size: 6, color: '#fffaf4', opacity: 0.72, delay: '0.9s' },
  { top: '72%', left: '78%', size: 4, color: '#f3df9b', opacity: 0.76, delay: '2s' },
  { top: '82%', left: '44%', size: 3, color: '#e7a39b', opacity: 0.7, delay: '1.2s' },
  { top: '88%', left: '14%', size: 4, color: '#fffaf4', opacity: 0.72, delay: '1.9s' },
  { top: '12%', left: '47%', size: 3, color: '#e7a39b', opacity: 0.62, delay: '2.3s' },
  { top: '38%', left: '52%', size: 5, color: '#fffaf4', opacity: 0.8, delay: '0.2s' },
  { top: '68%', left: '57%', size: 4, color: '#f3df9b', opacity: 0.7, delay: '1.6s' },
  { top: '80%', left: '88%', size: 3, color: '#fffaf4', opacity: 0.62, delay: '2.5s' }
];

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
    <div className="fixed inset-0 overflow-hidden bg-[linear-gradient(90deg,#f3df9b_0%,#fffaf4_14%,#e7a39b_34%,#e7a39b_66%,#fffaf4_86%,#f3df9b_100%)]">
      <div className={`absolute inset-0 z-10 flex items-center justify-center px-5 py-8 transition-opacity duration-300 ${phase === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="grid w-full max-w-[760px] grid-cols-1 items-center gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden aspect-square overflow-hidden rounded-[12px] bg-[#050508] shadow-2xl md:block">
            <div className="absolute inset-0">
              {BRAND_STARS.map((star, index) => (
                <span
                  key={index}
                  className="absolute rounded-full animate-pulse"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    backgroundColor: star.color,
                    opacity: star.opacity,
                    animationDelay: star.delay,
                    boxShadow: `0 0 ${star.size * 4}px ${star.color}`
                  }}
                />
              ))}
            </div>
            <img
              src="/images/WElogo.png"
              alt="Williamsville East logo"
              className="absolute inset-0 m-auto h-[72%] w-[72%] object-contain drop-shadow-[0_18px_32px_rgba(243,223,155,0.22)]"
              style={{ filter: 'contrast(1.12) saturate(1.22)' }}
            />
          </div>

          <div className={`w-full max-w-[360px] justify-self-center bg-white/5 backdrop-blur-[28px] border border-white/10 rounded-3xl p-7 shadow-2xl transition-all duration-500 ${isSignup || showForgot ? 'scale-105' : 'scale-100'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/images/roundedlogo.png"
              alt="Williamsville East High School Lost & Found logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-white font-extrabold text-sm tracking-tight">EastLost&amp;Found</span>
          </div>

          <h1 className="text-white text-xl font-extrabold text-center tracking-tight mb-1">
            {showForgot ? 'Recover Password' : isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-white/40 text-xs text-center mb-5">
            {showForgot ? 'Use your email and student ID' : isSignup ? 'Join the community today' : 'Sign in to continue'}
          </p>

          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <label htmlFor="forgot-email" className="sr-only">Email address</label>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  id="forgot-email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="forgot-student-id" className="sr-only">Student ID</label>
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  id="forgot-student-id"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
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
                className="w-full py-2.5 bg-white text-[#0d0d0d] rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
              >
                {isForgotLoading ? 'Checking...' : 'Recover Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage('');
                  setRecoveredPassword('');
                }}
                className="w-full text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignup && (
                <div className="relative">
                  <label htmlFor="signup-name" className="sr-only">Full Name</label>
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    id="signup-name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  id="auth-email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
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
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
                      id="signup-grade"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                      type="text"
                      placeholder="Grade"
                      value={grade}
                      onChange={e => setGrade(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="relative flex-1">
                    <label htmlFor="signup-student-id" className="sr-only">Student ID</label>
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
                      id="signup-student-id"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  id="auth-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
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
                  className="w-full text-white/50 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              )}

              {error && <p className="text-red-400 text-[10px] text-center font-bold animate-shake">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-white text-[#0d0d0d] rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignup ? 'Create Account' : 'Launch Portal'}
                    {isSignup ? <UserPlus size={14} /> : <LogIn size={14} />}
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
                className="w-full text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                {isSignup ? 'Already have an account? Sign In' : 'New here? Create an account'}
              </button>
            </form>
          )}
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
