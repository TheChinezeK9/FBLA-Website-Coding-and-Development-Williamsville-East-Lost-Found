import React from 'react';
import { Monitor, Code, Cog } from 'lucide-react';

export const MeetMakers: React.FC = () => {
  const team = [
    { name: 'Haolin Jin', role: 'Full-stack Engineer', icon: Monitor, image: '/images/Haolin.png' },
    { name: 'Justin Yu', role: 'Front-end Engineer', icon: Code, image: '/images/Justin.png' },
    { name: 'Abraham Joseph', role: 'Back-end Engineer', icon: Cog, image: '/images/Abraham.png' }
  ];

  return (
    <div className="min-h-screen w-full neon-page-bg pt-24 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Meet the Makers</h1>
        <p className="text-xl text-black dark:text-white mb-12">The creative minds behind the Williamsville East High School Lost &amp; Found.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => {
            const Icon = member.icon;

            return (
              <div key={member.name} className="bg-white dark:bg-[#2b2b2b] p-8 rounded-[18px] shadow-xl transition-transform hover:scale-[1.02] border border-transparent dark:border-[#4b5563]">
                <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-[#1f1f1f] rounded-full mb-6 overflow-hidden flex items-center justify-center border border-black dark:border-[#4b5563]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-1">{member.name}</h3>
                <p className="text-slate-500 dark:text-white text-sm font-bold uppercase tracking-widest mb-4">{member.role}</p>
                <div className="w-fit mx-auto flex items-center gap-2 px-3 py-1 rounded-full border border-black/20 dark:border-[#4b5563] text-slate-600 dark:text-white">
                  <Icon size={16} />
                  <span className="text-xs font-bold">{member.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
