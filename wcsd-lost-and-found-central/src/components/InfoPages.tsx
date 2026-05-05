import React from 'react';
import { Heart, Cloud, Star, Shield, CheckCircle, AlertTriangle, BookOpen, HelpCircle } from 'lucide-react';

interface InfoPagesProps {
  type: 'ABOUT' | 'RULES' | 'GUIDE';
}

export const InfoPages: React.FC<InfoPagesProps> = ({ type }) => {
  const content = {
    ABOUT: { 
      title: "Why We Built This", 
      subtitle: "Connecting lost items with their owners.", 
      icon: <Heart size={64} className="text-red-600" />, 
      sections: [
        { title: "Our Mission", text: "At Williamsville East High School, we want lost items returned quickly, clearly, and responsibly.", icon: <Cloud className="text-black dark:text-white" /> },
        { title: "Intelligent Recovery", text: "By focusing on one school board, we make item searches and claims simpler for East students and staff.", icon: <Star className="text-black dark:text-white" /> }
      ] 
    },
    RULES: { 
      title: "Safety First", 
      subtitle: "Guidelines for claiming and reporting.", 
      icon: <Shield size={64} className="text-blue-600" />, 
      sections: [
        { title: "Proof of Ownership", text: "To claim an item, you may be asked to provide specific details not visible in the photo.", icon: <CheckCircle className="text-black dark:text-white" /> },
        { title: "Honesty Policy", text: "False claims are strictly prohibited. Attempting to claim items that do not belong to you will result in disciplinary action.", icon: <AlertTriangle className="text-black dark:text-white" /> }
      ] 
    },
    GUIDE: { 
      title: "How It Works", 
      subtitle: "A quick walkthrough of the platform.", 
      icon: <BookOpen size={64} className="text-green-600" />, 
      sections: [
        { title: "Browse or Scan", text: "Either navigate to your specific school board to see recent items, or use the 'AI Scanner' to scan an item.", icon: <HelpCircle className="text-black dark:text-white" /> },
        { title: "Request a Claim", text: "When you find your item, click 'Claim'. Fill out your student information, and an administrator will verify your claim.", icon: <Star className="text-black dark:text-white" /> }
      ] 
    }
  };
  
  const data = content[type];
  if (!data) return null;
  
  return (
    <div className="min-h-screen w-full neon-page-bg pt-24 pb-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-transparent border border-black dark:border-white mb-6 sm:mb-8">{data.icon}</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 tracking-tight">{data.title}</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-black dark:text-white font-light max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="bg-white dark:bg-[#666666] rounded-[18px] p-6 sm:p-8 md:p-12 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {data.sections.map((section, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-transparent border border-black dark:border-white">{section.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white">{section.title}</h3>
                </div>
                <p className="text-black dark:text-white text-base sm:text-lg leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
