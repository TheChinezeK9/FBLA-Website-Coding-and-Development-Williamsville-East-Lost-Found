import React, { useState } from 'react';
import { Phone, Mail, MapPin, ChevronRight, ArrowLeft, Code, Monitor, Cog, Briefcase, Trophy, Bus, School as SchoolIcon, Building2, GraduationCap } from 'lucide-react';
import { SCHOOL_THEMES } from '../constants';
import { SchoolTheme } from '../types';

export const ContactsPage: React.FC = () => {
  const [view, setView] = useState<'ROOT' | 'ADMIN' | 'FACILITIES_MENU' | 'SPORTS' | 'BUS' | 'MAIN_OFFICE_SELECT' | 'SCHOOL_DETAIL'>('ROOT');
  const [selectedSchool, setSelectedSchool] = useState<SchoolTheme | null>(null);

  const CardButton = ({ icon: Icon, title, description, onClick, colorClass }: any) => (
    <button onClick={onClick} className="group w-full p-8 rounded-[24px] bg-white dark:bg-[#666666] backdrop-blur-sm shadow-xl text-left hover:scale-[1.02] transition-all duration-300 relative overflow-hidden z-10">
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500"><Icon size={120} /></div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${colorClass} text-white shadow-lg group-hover:rotate-12 transition-transform duration-300`}><Icon size={32} /></div>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{title}</h3>
      <p className="text-black dark:text-white font-medium text-lg">{description}</p>
      <div className="mt-8 flex items-center text-sm font-bold uppercase tracking-widest text-black dark:text-white">View Contacts <ChevronRight size={16} className="ml-1" /></div>
    </button>
  );

  const ContactItem = ({ name, role, phone, email, icon: Icon }: any) => (
     <div className="bg-white dark:bg-[#666666] backdrop-blur-sm p-6 rounded-[20px] shadow-xl flex flex-col md:flex-row md:items-center gap-6 z-10 animate-fade-in-up">
      <div className="w-16 h-16 bg-slate-50 dark:bg-[#666666] rounded-full flex items-center justify-center text-black dark:text-white shadow-inner"><Icon size={32} /></div>
      <div className="flex-1">
        <h4 className="text-xl font-bold text-black dark:text-white">{name}</h4>
        <p className="font-bold uppercase text-xs tracking-wider mb-3 text-black dark:text-white">{role}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-bold text-black dark:text-white hover:text-[#ed1e25] transition-colors bg-slate-100 dark:bg-[#666666] px-4 py-2 rounded-full"><Phone size={14} /> {phone}</a>}
          {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm font-bold text-black dark:text-white hover:text-[#ed1e25] transition-colors bg-slate-100 dark:bg-[#666666] px-4 py-2 rounded-full"><Mail size={14} /> {email}</a>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full neon-page-bg pt-28 pb-20 px-6 transition-colors duration-300 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12">
          {view !== 'ROOT' && (
            <button onClick={() => { if (view === 'SCHOOL_DETAIL') setView('MAIN_OFFICE_SELECT'); else if (view === 'SPORTS' || view === 'BUS' || view === 'MAIN_OFFICE_SELECT') setView('FACILITIES_MENU'); else setView('ROOT'); }} className="flex items-center gap-2 text-black dark:text-white hover:text-slate-900 font-bold mb-6 transition-colors bg-slate-100 dark:bg-black px-4 py-2 rounded-full w-fit backdrop-blur-sm border border-slate-300 dark:border-white/20 shadow-sm">
              <ArrowLeft size={20} /> Back
            </button>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-4 drop-shadow-sm">
            {view === 'ROOT' && 'Contact Directory'}{view === 'ADMIN' && 'Website Creators'}{view === 'FACILITIES_MENU' && 'Facilities & Services'}{view === 'SPORTS' && 'Athletics Department'}{view === 'BUS' && 'Transportation'}{view === 'MAIN_OFFICE_SELECT' && 'Select School Office'}{view === 'SCHOOL_DETAIL' && selectedSchool?.name}
          </h1>
        </div>
        
        {view === 'ROOT' && (
          <div className="grid md:grid-cols-2 gap-8">
            <CardButton title="Website Admins" description="Contact the student creators, maintainers, and platform support." icon={Code} colorClass="bg-blue-600" onClick={() => setView('ADMIN')} />
            <CardButton title="Facilities & Services" description="Athletics, transportation (buses), and Williamsville East offices." icon={Briefcase} colorClass="bg-orange-500" onClick={() => setView('FACILITIES_MENU')} />
          </div>
        )}
        
        {view === 'ADMIN' && (
          <div className="grid gap-6">
            <ContactItem name="Haolin Jin" role="Full-stack Engineer" email="haolin.jin01@gmail.com" icon={Monitor} />
            <ContactItem name="Justin Yu" role="Front-end Engineer" email="iamlightrocks@gmail.com" icon={Code} />
            <ContactItem name="Abraham Joseph" role="Back-end Engineer" email="abejoseph26@gmail.com" icon={Cog} />
          </div>
        )}
        
        {view === 'FACILITIES_MENU' && (
          <div className="grid md:grid-cols-3 gap-6">
            <CardButton title="Athletics" description="Sports facilities & booking." icon={Trophy} colorClass="bg-emerald-500" onClick={() => setView('SPORTS')} />
            <CardButton title="Transportation" description="Buses & routing." icon={Bus} colorClass="bg-yellow-500" onClick={() => setView('BUS')} />
            <CardButton title="Main Office" description="Williamsville East contacts." icon={SchoolIcon} colorClass="bg-indigo-500" onClick={() => setView('MAIN_OFFICE_SELECT')} />
          </div>
        )}
        
        {view === 'SPORTS' && (
          <div className="grid gap-6">
            <ContactItem name="Chris Mucica" role="District Athletic Director" phone="(716) 626-8030" email="cmucica@williamsvillek12.org" icon={Trophy} />
            <ContactItem name="Facilities Rental" role="Field & Gym Booking" phone="(716) 626-8009" email="facilities@williamsvillek12.org" icon={Building2} />
          </div>
        )}
        
        {view === 'BUS' && (
          <div className="grid gap-6">
            <ContactItem name="Transportation Office" role="Main Dispatch" phone="(716) 626-8390" email="transportation@williamsvillek12.org" icon={Bus} />
          </div>
        )}
        
        {view === 'MAIN_OFFICE_SELECT' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(SCHOOL_THEMES).map((school) => (
              <button key={school.id} onClick={() => { setSelectedSchool(school); setView('SCHOOL_DETAIL'); }} className="flex items-center gap-4 p-4 bg-white dark:bg-[#666666] border-2 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm z-10" style={{ borderColor: school.palette.primary }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#666666]"><img src={school.logo} alt={school.name} className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=random&color=fff&size=200`; }} /></div>
                <div className="text-left"><h4 className="font-bold text-black dark:text-white text-sm leading-tight">{school.name}</h4></div>
              </button>
            ))}
          </div>
        )}
        
        {view === 'SCHOOL_DETAIL' && selectedSchool && (
          <div className="space-y-6">
            <div className="p-10 rounded-[24px] shadow-xl relative overflow-hidden z-10" style={{ backgroundColor: selectedSchool.palette.primary }}>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 bg-white rounded-full p-4 shadow-lg flex-shrink-0"><img src={selectedSchool.logo} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSchool.name)}&background=random&color=fff&size=200`; }} /></div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white mb-2">{selectedSchool.name}</h2>
                  <p className="opacity-90 font-medium text-lg flex items-center justify-center md:justify-start gap-2 text-white"><MapPin size={20} /> {selectedSchool.contactInfo.address}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              <ContactItem name={selectedSchool.contactInfo.principal} role="Principal" phone={selectedSchool.contactInfo.phone} email={selectedSchool.contactInfo.email} icon={GraduationCap} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
