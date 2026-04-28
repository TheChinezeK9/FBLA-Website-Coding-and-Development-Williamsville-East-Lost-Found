import React from 'react';
import { Heart, Sun, Music, Smile, Zap, Cloud, Star, Sparkles } from 'lucide-react';

interface DoodleBackgroundProps {
  isDarkMode: boolean;
}

export const DoodleBackground: React.FC<DoodleBackgroundProps> = ({ isDarkMode }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${isDarkMode ? 'opacity-60' : 'opacity-45'}`}>
    <svg className={`absolute top-[5%] left-[2%] w-72 h-72 animate-float-slow ${isDarkMode ? 'text-[#39ff14]/30' : 'text-yellow-400/60'}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,88.9,-6.3C87.7,7.9,82.6,21.8,74.5,33.8C66.5,45.8,55.5,55.9,43.3,63.2C31.1,70.5,17.7,75,4.1,75.7C-9.5,76.4,-23.1,73.4,-36.1,66.6C-49.1,59.8,-61.5,49.2,-70.3,36.5C-79.1,23.8,-84.3,9,-83.4,-5.4C-82.5,-19.8,-75.5,-33.8,-65.3,-44.6C-55.1,-55.4,-41.7,-63,-28.4,-70.7C-15.1,-78.4,-1.9,-86.2,12.3,-84.1C26.5,-82,40.7,-70,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>

    <svg className={`absolute bottom-[15%] right-[-5%] w-96 h-96 animate-float-delayed ${isDarkMode ? 'text-[#00ffcc]/22' : 'text-blue-400/40'}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M41.7,-67.6C54.1,-62.7,64.4,-53,72.3,-41.7C80.2,-30.4,85.7,-17.5,84.7,-5.2C83.7,7.1,76.2,18.8,68.4,30.3C60.6,41.8,52.5,53.1,41.9,61.9C31.3,70.7,18.2,77,4.5,77.8C-9.2,78.6,-27.4,73.9,-41.6,66.3C-55.8,58.7,-66,48.2,-72.7,35.9C-79.4,23.6,-82.6,9.5,-79.8,-3.4C-77,-16.3,-68.2,-28,-58.5,-37.6C-48.8,-47.2,-38.2,-54.7,-27.1,-60.8C-16,-66.9,-4.4,-71.6,7.5,-72.9C19.4,-74.2,31.3,-72.1,41.7,-67.6Z" transform="translate(100 100)" />
    </svg>

    <svg className={`absolute top-[40%] left-[-5%] w-64 h-64 animate-wiggle ${isDarkMode ? 'text-[#b439ff]/22' : 'text-purple-400/40'}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M38.1,-53.4C49.8,-46.7,60,-36.8,66.4,-24.8C72.8,-12.8,75.4,1.3,71.8,13.9C68.2,26.5,58.4,37.6,47.5,46.1C36.6,54.6,24.6,60.5,12.3,62.5C0,64.5,-12.6,62.6,-24.1,57.1C-35.6,51.6,-45.9,42.5,-53.5,31.3C-61.1,20.1,-65.9,6.8,-64.3,-5.7C-62.7,-18.2,-54.7,-29.9,-44.6,-39.3C-34.5,-48.7,-22.3,-55.8,-9.6,-57.4C3.1,-59,15.8,-55.1,26.4,-60.1Z" transform="translate(100 100)" />
    </svg>

    <div className={`absolute top-[18%] left-[18%] animate-bounce-slow ${isDarkMode ? 'text-[#ff3cac]' : 'text-pink-500'}`}><Heart size={40} fill="currentColor" className="opacity-65" /></div>
    <div className={`absolute top-[28%] right-[25%] animate-spin-slow ${isDarkMode ? 'text-white' : 'text-yellow-500'}`}><Sun size={56} className="opacity-65" /></div>
    <div className={`absolute bottom-[35%] left-[12%] animate-wiggle ${isDarkMode ? 'text-white' : 'text-indigo-500'}`}><Music size={40} className="opacity-65" /></div>
    <div className={`absolute bottom-[15%] right-[20%] animate-float ${isDarkMode ? 'text-white' : 'text-emerald-500'}`}><Smile size={52} className="opacity-65" /></div>
    <div className={`absolute top-[55%] left-[8%] animate-pulse ${isDarkMode ? 'text-[#ffe600]' : 'text-purple-500'}`}><Zap size={32} fill="currentColor" className="opacity-65" /></div>
    <div className={`absolute top-[45%] right-[8%] animate-float-slow ${isDarkMode ? 'text-[#00cfff]' : 'text-sky-400'}`}><Cloud size={64} fill="currentColor" className="opacity-65" /></div>
    <div className={`absolute bottom-[8%] left-[45%] animate-bounce-slow ${isDarkMode ? 'text-[#ff6b35]' : 'text-orange-400'}`} style={{ animationDelay: '1s' }}><Star size={36} fill="currentColor" className="opacity-65" /></div>
    <div className={`absolute top-[12%] right-[45%] animate-wiggle ${isDarkMode ? 'text-[#b439ff]' : 'text-teal-400'}`} style={{ animationDelay: '2s' }}><Sparkles size={44} className="opacity-65" /></div>
  </div>
);
