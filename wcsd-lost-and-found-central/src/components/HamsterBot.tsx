import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Send, X } from 'lucide-react';

export const HamsterBot: React.FC = () => {
  const FULLSCREEN_TOP_OFFSET = 92;
  const FULLSCREEN_GAP = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'model' | 'user'; text: string }[]>([
    { role: 'model', text: "Hello there! I'm Hammy! 🐹 Did you lose something? I can help you find it!" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [panelSize, setPanelSize] = useState({ w: 384, h: 500 });
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const resizeStateRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const previousLayoutRef = useRef<{ w: number; h: number; x: number; y: number } | null>(null);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const clampPosition = (x: number, y: number, width: number, height: number) => {
    const maxX = Math.max(8, window.innerWidth - width - 8);
    const maxY = Math.max(8, window.innerHeight - height - 8);
    return {
      x: clamp(x, 8, maxX),
      y: clamp(y, 8, maxY)
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const openBot = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      if (event.detail?.source !== 'tools-chatbot') return;
      setIsOpen(true);
    };
    window.addEventListener('open-hammy-bot', openBot as EventListener);
    return () => window.removeEventListener('open-hammy-bot', openBot as EventListener);
  }, []);

  useEffect(() => {
    if (initialized) return;
    const w = 384;
    const h = 500;
    const x = window.innerWidth - w - 20;
    const y = window.innerHeight - h - 24;
    const clamped = clampPosition(x, y, w, h);
    setPanelPos(clamped);
    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (isFullscreen) {
        setPanelPos({ x: FULLSCREEN_GAP, y: FULLSCREEN_TOP_OFFSET });
        setPanelSize({
          w: Math.max(280, window.innerWidth - FULLSCREEN_GAP * 2),
          h: Math.max(260, window.innerHeight - FULLSCREEN_TOP_OFFSET - FULLSCREEN_GAP)
        });
        return;
      }
      setPanelSize(prev => {
        const maxW = Math.max(280, window.innerWidth - 16);
        const maxH = Math.max(260, window.innerHeight - 16);
        const next = {
          w: clamp(prev.w, 280, maxW),
          h: clamp(prev.h, 260, maxH)
        };
        const clamped = clampPosition(panelPos.x, panelPos.y, next.w, next.h);
        setPanelPos(clamped);
        return next;
      });
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [FULLSCREEN_GAP, FULLSCREEN_TOP_OFFSET, isFullscreen, panelPos.x, panelPos.y]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragStateRef.current) {
        const x = e.clientX - dragStateRef.current.offsetX;
        const y = e.clientY - dragStateRef.current.offsetY;
        setPanelPos(clampPosition(x, y, panelSize.w, panelSize.h));
        return;
      }

      if (resizeStateRef.current) {
        const dx = e.clientX - resizeStateRef.current.startX;
        const dy = e.clientY - resizeStateRef.current.startY;
        const maxW = Math.max(280, window.innerWidth - panelPos.x - 8);
        const maxH = Math.max(260, window.innerHeight - panelPos.y - 8);
        const nextW = clamp(resizeStateRef.current.startW + dx, 280, maxW);
        const nextH = clamp(resizeStateRef.current.startH + dy, 260, maxH);
        setPanelSize({ w: nextW, h: nextH });
      }
    };

    const onUp = () => {
      dragStateRef.current = null;
      resizeStateRef.current = null;
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [panelPos.x, panelPos.y, panelSize.w, panelSize.h]);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) return;
    dragStateRef.current = {
      offsetX: e.clientX - panelPos.x,
      offsetY: e.clientY - panelPos.y
    };
    document.body.style.userSelect = 'none';
  };

  const startResize = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: panelSize.w,
      startH: panelSize.h
    };
    document.body.style.userSelect = 'none';
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      previousLayoutRef.current = { w: panelSize.w, h: panelSize.h, x: panelPos.x, y: panelPos.y };
      setPanelPos({ x: FULLSCREEN_GAP, y: FULLSCREEN_TOP_OFFSET });
      setPanelSize({
        w: Math.max(280, window.innerWidth - FULLSCREEN_GAP * 2),
        h: Math.max(260, window.innerHeight - FULLSCREEN_TOP_OFFSET - FULLSCREEN_GAP)
      });
      setIsFullscreen(true);
      return;
    }
    const previous = previousLayoutRef.current;
    if (previous) {
      setPanelSize({ w: previous.w, h: previous.h });
      setPanelPos(clampPosition(previous.x, previous.y, previous.w, previous.h));
    }
    setIsFullscreen(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: userMsg }] }],
          config: {
            systemInstruction: "You are 'Hammy', a cute, helpful, and energetic hamster mascot for the Williamsville School District Lost and Found platform. You talk with light excitement, use emojis (🐹, 🥜, ✨), and help students locate items on the platform. Be concise and friendly."
          }
        })
      });

      if (!response.ok) throw new Error('Proxy error');

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ||
        '';

      setMessages(prev => [...prev, { role: 'model', text: text || "I'm not sure what to say!" }]);
    } catch (error) {
      console.error('Hammy error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Oops! My hamster wheel got stuck! 🐹 Try again later? ✨' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {initialized && isOpen && (
        <div
          className="fixed z-[50] rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-200 bg-white dark:bg-[#2b2b2b] border border-transparent dark:border-[#4b5563]"
          style={{ left: panelPos.x, top: panelPos.y, width: panelSize.w, height: panelSize.h }}
        >
          <div onMouseDown={startDrag} className={`bg-[#ab1e2f] p-4 flex justify-between items-center select-none ${isFullscreen ? 'cursor-default' : 'cursor-move'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🐹</div>
              <div>
                <h3 className="text-white font-bold leading-tight">Hammy Bot</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors"><X size={20} /></button>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-72px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#2b2b2b] no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl font-medium text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#ab1e2f] text-white rounded-tr-none' : 'bg-white dark:bg-[#1f1f1f] text-black dark:text-white rounded-tl-none border border-gray-200 dark:border-[#4b5563]'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl shadow-sm flex gap-2 border border-gray-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f]">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 flex gap-2 bg-white dark:bg-[#2b2b2b] border-t border-gray-200 dark:border-[#4b5563]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Hammy anything..."
                className="flex-1 rounded-[12px] px-3 py-2 outline-none text-black dark:text-white bg-white dark:bg-[#1f1f1f] border-2 border-black dark:border-[#4b5563] focus:ring-2 focus:ring-[#ab1e2f]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-2 bg-[#ab1e2f] text-white rounded-[12px] hover:bg-[#8f1927] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {!isFullscreen && (
            <button
              type="button"
              aria-label="Resize Hammy Bot"
              onMouseDown={startResize}
              className="absolute bottom-1 right-1 w-5 h-5 rounded-sm text-slate-400 hover:text-slate-200"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 ml-auto mt-auto">
                <path d="M6 16H4l12-12v2L6 16zm5 0h-2l7-7v2l-5 5zm-10 0H0l16-16v1L1 16z" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[50] pointer-events-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-gray-800' : 'bg-[#ab1e2f]'}`}
        >
          <div className="flex items-center justify-center w-full h-full text-white">
            {isOpen ? <X size={28} /> : <div className="text-3xl animate-bounce">🐹</div>}
          </div>
        </button>
      </div>
    </>
  );
};
