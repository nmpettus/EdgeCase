import React from 'react';
import { EdgeCaseExample } from '../types';
import { ChevronRight } from 'lucide-react';

interface GalleryCarouselProps {
  items: EdgeCaseExample[];
  onSelect: (item: EdgeCaseExample) => void;
  isDarkMode: boolean;
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ items, onSelect, isDarkMode }) => {
  const themeClasses = {
    card: isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-400',
    text: isDarkMode ? 'text-slate-200' : 'text-slate-800',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className="w-full relative">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 pt-1 px-1 scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
        
        {/* Gallery Items */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`snap-center shrink-0 w-[140px] h-[180px] rounded-2xl border-2 overflow-hidden relative group transition-all text-left shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 ${themeClasses.card}`}
          >
            <div className="h-2/3 w-full relative overflow-hidden">
              <img 
                src={item.url} 
                alt={item.label} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <ChevronRight size={12} className="text-indigo-600" />
              </div>
            </div>
            <div className={`h-1/3 w-full p-2 flex items-center justify-center text-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-xs font-medium leading-snug ${themeClasses.text}`}>
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GalleryCarousel;