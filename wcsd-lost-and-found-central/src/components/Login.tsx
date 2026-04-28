import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { User as UserIcon, Lock, LogIn, UserPlus, Mail, GraduationCap, Hash } from 'lucide-react';
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ isWarping: false, warpStartTime: 0, wooshTriggered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x050508, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 4, 6);
    scene.add(dirLight);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const earthTex = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    earthTex.wrapS = THREE.RepeatWrapping;
    earthTex.wrapT = THREE.ClampToEdgeWrapping;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earthTex,
        emissive: new THREE.Color('#112244'),
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.2,
      })
    );
    globeGroup.add(earthMesh);

    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.10,
        side: THREE.BackSide,
      })
    ));

    const PALETTE = ['#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#fb923c', '#e879f9'];
    const ICON_COUNT = 18;
    const iconGroup = new THREE.Group();
    globeGroup.add(iconGroup);

    const iconSprites: THREE.Sprite[] = [];
    for (let i = 0; i < ICON_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / ICON_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.1;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      const color = PALETTE[i % PALETTE.length];

      const off = document.createElement('canvas');
      off.width = 128;
      off.height = 128;
      const ctx = off.getContext('2d')!;
      ctx.shadowColor = color;
      ctx.shadowBlur = 32;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(64, 64, 32, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(off);

      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.22, 0.22, 1);
      sprite.position.set(x, y, z);
      sprite.userData.originPos = new THREE.Vector3(x, y, z);
      iconGroup.add(sprite);

      const blink = () => {
        const showDelay = Math.random() * 5000;
        const hideDelay = 2000 + Math.random() * 3000;
        setTimeout(() => {
          sprite.userData.targetOpacity = 1;
          setTimeout(() => {
            sprite.userData.targetOpacity = 0;
            setTimeout(blink, Math.random() * 2000 + 500);
          }, hideDelay);
        }, showDelay);
      };
      sprite.userData.targetOpacity = 0;
      blink();
      iconSprites.push(sprite);
    }

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let animId: number;
    let warpElapsed = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const { isWarping } = stateRef.current;

      const speed = isWarping ? 25 : 1;
      globeGroup.rotation.y += 0.003 * speed * dt * 60;

      if (isWarping) {
        warpElapsed += dt;
        camera.fov = THREE.MathUtils.lerp(camera.fov, 160, 0.08);
        camera.updateProjectionMatrix();

        iconSprites.forEach((sprite, i) => {
          const orig = sprite.userData.originPos as THREE.Vector3;
          const disperseZ = warpElapsed * 4 * (1 + i * 0.05);
          sprite.position.set(orig.x, orig.y, orig.z + disperseZ);
          sprite.material.opacity = Math.max(0, 1 - warpElapsed * 1.5);
        });

        if (warpElapsed > 1.2 && !stateRef.current.wooshTriggered) {
          stateRef.current.wooshTriggered = true;
          setPhase('woosh');
        }
      } else {
        iconSprites.forEach(sprite => {
          const target = sprite.userData.targetOpacity ?? 0;
          sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, target, 0.06);
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
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
      stateRef.current.isWarping = true;
      stateRef.current.warpStartTime = performance.now();
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
    <div className="fixed inset-0 bg-[#050508] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${phase === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-[360px] bg-white/5 backdrop-blur-[28px] border border-white/10 rounded-3xl p-7 shadow-2xl transition-all duration-500 ${isSignup || showForgot ? 'scale-105' : 'scale-100'}`}>
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
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
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
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
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                      type="text"
                      placeholder="Grade"
                      value={grade}
                      onChange={e => setGrade(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
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

      {phase === 'warping' && (
        <div className="absolute inset-0 z-8 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border-2 border-white/15 shadow-[0_0_60px_rgba(96,165,250,0.4),0_0_120px_rgba(96,165,250,0.15)] animate-[warpRing_0.4s_ease-out_infinite]" />
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
