import React from 'react';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-[#0d1b2e] border-t border-white/10 mt-0">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-[#ab1e2f] rounded-lg flex items-center justify-center text-white font-black text-lg">F</div>
            <span className="text-white font-extrabold text-sm tracking-tight">WCSD Lost&Found</span>
          </div>
          <p className="text-white/45 text-xs leading-relaxed mb-1">105 Casey Rd<br/>Williamsville, NY 14221</p>
          <p className="text-white/45 text-xs mb-1">(716) 626-8000</p>
          <p className="text-white/35 text-[11px] mt-4 italic">WCSD Lost & Found — Since 2026</p>
        </div>

        <div>
          <h4 className="text-white text-[11px] font-black tracking-[0.2em] uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['Home','HOME'],['Schools','SCHOOL_SELECT'],['AI Scanner','LIVE_TRACKER'],['Contacts','CONTACTS'],['Meet the Team','MEET_MAKERS']].map(([label, view]) => (
              <li key={label}>
                <button onClick={() => onNavigate(view as View)} className="text-white/50 text-xs hover:text-white transition-colors text-left">{label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[11px] font-black tracking-[0.2em] uppercase mb-4">Resources</h4>
          <ul className="space-y-2.5">
            {[['About Project','ABOUT'],['Safety Rules','RULES'],['Help Guide','GUIDE'],['File a Claim','SCHOOL_SELECT']].map(([label, view]) => (
              <li key={label}>
                <button onClick={() => onNavigate(view as View)} className="text-white/50 text-xs hover:text-white transition-colors text-left">{label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-[11px] font-black tracking-[0.2em] uppercase mb-4">Search Items</h4>
          <div className="flex rounded-lg overflow-hidden border border-white/15">
            <input placeholder="Search..." className="flex-1 bg-white/5 border-none px-3 py-2 text-white text-xs outline-none focus:bg-white/10" />
            <button onClick={() => onNavigate('SCHOOL_SELECT')} className="bg-[#ab1e2f] px-3 py-2 text-white font-bold text-[11px] tracking-wider hover:bg-[#8f1927]">Search</button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-8 py-4 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        <p className="text-white/30 text-[11px]">© {currentYear} Williamsville Central School District Lost & Found. Built with ♥ by Justin, Haolin, and Abraham.</p>
        <div className="flex gap-5">
          {[
            { label: 'Privacy Policy', href: '/privacypolicy.html' },
            { label: 'Terms of Use', href: '/termsofservice.html' },
            { label: 'Accessibility', href: '/accessibility.html' }
          ].map(link => (
            <a key={link.label} href={link.href} className="text-white/30 text-[11px] hover:text-white/60 transition-colors">{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};
