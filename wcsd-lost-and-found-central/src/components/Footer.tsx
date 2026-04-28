import React from 'react';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-[#f3df9b] border-t border-[#e7a39b] mt-0">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[#e7a39b] rounded-lg flex items-center justify-center text-black font-black text-lg">E</div>
            <span className="text-black font-extrabold text-sm tracking-tight">East Lost&amp;Found</span>
          </div>
          <p className="text-black/70 text-xs leading-relaxed mb-1">151 Paradise Rd<br/>East Amherst, NY 14051</p>
          <p className="text-black/70 text-xs mb-1">(716) 626-8400</p>
          <p className="text-[#4a403a] text-[11px] mt-4 italic">Williamsville East High School</p>
        </div>

        <div>
          <h4 className="text-black text-[11px] font-black tracking-[0.2em] uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['Home','HOME'],['Item Board','BULLETIN_BOARD'],['AI Scanner','LIVE_TRACKER'],['Contacts','CONTACTS'],['Meet the Team','MEET_MAKERS']].map(([label, view]) => (
              <li key={label}>
                <button onClick={() => onNavigate(view as View)} className="text-black/60 text-xs hover:text-black transition-colors text-left">{label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-black text-[11px] font-black tracking-[0.2em] uppercase mb-4">Resources</h4>
          <ul className="space-y-2.5">
            {[['About Project','ABOUT'],['Safety Rules','RULES'],['Help Guide','GUIDE'],['File a Claim','BULLETIN_BOARD']].map(([label, view]) => (
              <li key={label}>
                <button onClick={() => onNavigate(view as View)} className="text-black/60 text-xs hover:text-black transition-colors text-left">{label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-black text-[11px] font-black tracking-[0.2em] uppercase mb-4">Search Items</h4>
          <div className="flex rounded-lg overflow-hidden border border-black/15">
            <input placeholder="Search..." className="flex-1 bg-black/5 border-none px-3 py-2 text-black text-xs outline-none focus:bg-black/10" />
            <button onClick={() => onNavigate('BULLETIN_BOARD')} className="bg-[#e7a39b] px-3 py-2 text-black font-bold text-[11px] tracking-wider hover:bg-[#ebb2ab]">Search</button>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 px-8 py-4 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        <p className="text-black/40 text-[11px]">© {currentYear} Williamsville East High School Lost & Found. Built with ♥ by Justin, Haolin, and Abraham.</p>
        <div className="flex gap-5">
          {[
            { label: 'Privacy Policy', href: '/privacypolicy.html' },
            { label: 'Terms of Use', href: '/termsofservice.html' },
            { label: 'Accessibility', href: '/accessibility.html' }
          ].map(link => (
            <a key={link.label} href={link.href} className="text-black/40 text-[11px] hover:text-black/70 transition-colors">{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};
