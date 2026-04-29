import React from 'react';
import { FileText, Camera } from 'lucide-react';
import { View } from '../types';

interface HomeProps {
  onNavigate: (view: View) => void;
  onStartClaim: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onStartClaim }) => (
  <div className="neon-page-bg min-h-screen font-sans pb-20 transition-colors duration-300 relative overflow-hidden">
    <div className="text-center px-4 max-w-4xl mx-auto relative z-10 mt-20">

      <div className="mx-auto mt-5 mb-10 w-full sm:w-2/3 md:w-1/2 max-w-[1000px] p-2 bg-transparent rounded-lg animate-fade-in-up">
        <img
          src="/images/east.png"
          alt="Williamsville East High School Logo"
          className="w-full h-auto mx-auto transform scale-100 md:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://ui-avatars.com/api/?name=Williamsville+East+High+School&background=e7a39b&color=000&size=200';
          }}
        />
      </div>

      <h1 className="text-black dark:text-white text-3xl font-bold my-4 leading-tight">
        Williamsville East High School Lost &amp; Found
      </h1>

      <p className="text-black dark:text-white text-lg italic my-4 font-serif">
        "Nothing is ever really lost to us as long as we remember it" - L.M. Montgomery
      </p>

      <button
        onClick={() => onNavigate('BULLETIN_BOARD')}
        className="bg-[#f3df9b] text-black border-2 border-[#f3df9b] w-[250px] mt-8 py-3 rounded-[25px] text-lg cursor-pointer hover:scale-105 transition-transform duration-200 font-bold shadow-lg hover:shadow-xl"
      >
        View Lost Items →
      </button>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={onStartClaim}
          className="flex items-center justify-center gap-2 bg-[#ed1e25] text-black border-2 border-[#ed1e25] dark:border-[#ed1e25] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md"
        >
          <FileText size={16} /> File a Claim
        </button>

        <button
          onClick={() => onNavigate('LIVE_TRACKER')}
          className="flex items-center justify-center gap-2 bg-[#ed1e25] text-black border-2 border-[#ed1e25] dark:border-[#ed1e25] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md"
        >
          <Camera size={16} /> AI Scanner
        </button>
      </div>

    </div>
  </div>
);
