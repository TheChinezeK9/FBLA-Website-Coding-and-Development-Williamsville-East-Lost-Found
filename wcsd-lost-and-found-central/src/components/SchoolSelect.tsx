import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SchoolTheme } from '../types';
import { SCHOOL_THEMES } from '../constants';

interface SchoolSelectProps {
  onSelect: (school: SchoolTheme) => void;
}

export const SchoolSelect: React.FC<SchoolSelectProps> = ({ onSelect }) => {
  const [filter, setFilter] = useState('');
  const filteredSchools = Object.values(SCHOOL_THEMES).filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen w-full neon-page-bg py-8 px-4 transition-colors duration-300 relative">
      <div className="max-w-[900px] mx-auto bg-white dark:bg-[#666666] backdrop-blur-md p-8 rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative z-10">
        <div className="max-w-[900px] mx-auto p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Select a School</h1>
            <div className="relative w-[80%] max-w-[500px] mx-auto">
              <input
                type="text"
                placeholder="Search for a school..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 pl-4 rounded-[12px] block text-black dark:text-white border border-black dark:border-white bg-white dark:bg-[#666666] outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-black dark:placeholder:text-white transition-colors"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white" size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {filteredSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => onSelect(school)}
                className="w-full neon-card bg-white dark:bg-[#666666] border-2 rounded-lg p-3 flex items-center transition-transform hover:scale-[1.02] active:scale-95 group shadow-sm hover:shadow-md"
                style={{ borderColor: school.palette.primary }}
              >
                <img
                  src={school.logo}
                  alt={school.name}
                  className="w-8 h-8 object-contain mr-4"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=random&color=fff&size=200`;
                  }}
                />
                <span className="text-black dark:text-white font-bold text-base text-left">{school.name}</span>
              </button>
            ))}

            {filteredSchools.length === 0 && (
              <div className="text-center py-12 text-black dark:text-white">
                No schools found matching "{filter}"
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
