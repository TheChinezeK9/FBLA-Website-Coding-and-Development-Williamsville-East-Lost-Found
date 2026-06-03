import React from 'react';
import { FileText, Camera } from 'lucide-react';
import { View } from '../types';

interface HomeProps {
  onNavigate: (view: View) => void;
  onStartClaim: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onStartClaim }) => (
  <div className="neon-page-bg min-h-screen font-sans pb-20 transition-colors duration-300 relative overflow-hidden">
    <div className="text-center px-4 sm:px-6 max-w-4xl mx-auto relative z-10 pt-10 sm:pt-12">

      <div className="mx-auto mt-1 sm:mt-2 mb-5 sm:mb-7 w-[88%] max-w-[285px] sm:w-2/3 sm:max-w-[380px] md:w-1/2 md:max-w-[480px] p-2 bg-transparent rounded-lg animate-fade-in-up">
        <img
          src="/images/east.png"
          alt="Williamsville East High School Logo"
          className="w-full h-auto mx-auto"
          onError={(e) => {
            e.currentTarget.src =
              'https://ui-avatars.com/api/?name=Williamsville+East+High+School&background=e7a39b&color=000&size=200';
          }}
        />
      </div>

      <h1 className="home-hero-title text-black dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold my-2 sm:my-3 leading-tight px-2">
        <span>Williamsville East High School</span>{' '}
        <span>Lost &amp; Found</span>
      </h1>

      <p className="home-quote mx-auto my-2 sm:my-3 max-w-xl text-black dark:text-white sm:max-w-none sm:whitespace-nowrap sm:text-lg text-base italic font-serif leading-relaxed">
        <span>"Nothing is ever really lost to us as long as we remember it"</span>{' '}
        <span className="quote-author whitespace-nowrap">- L.M. Montgomery</span>
      </p>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('wcsd_focus_item_board', 'true');
          }
          onNavigate('BULLETIN_BOARD');
        }}
        className="inline-flex items-center justify-center bg-[#f3df9b] text-black border-2 border-[#f3df9b] w-full max-w-[250px] mt-5 sm:mt-6 py-3 rounded-[25px] text-base sm:text-lg cursor-pointer hover:scale-105 transition-transform duration-200 font-bold shadow-lg hover:shadow-xl"
        aria-label="Skip to the item board"
      >
        <span>View Lost Items →</span>
      </button>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 sm:mt-5 mx-auto">
        <button
          onClick={onStartClaim}
          className="flex items-center justify-center gap-2 bg-[#e7a39b] text-black border-2 border-[#e7a39b] dark:border-[#e7a39b] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md"
        >
          <FileText size={16} /> <span>File a Claim</span>
        </button>

        <button
          onClick={() => onNavigate('LIVE_TRACKER')}
          className="flex items-center justify-center gap-2 bg-[#e7a39b] text-black border-2 border-[#e7a39b] dark:border-[#e7a39b] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md"
        >
          <Camera size={16} /> <span>AI Scanner</span>
        </button>
      </div>

    </div>
  </div>
);
