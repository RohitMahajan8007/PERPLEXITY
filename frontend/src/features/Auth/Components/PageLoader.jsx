import React from 'react';
import Spinner from './Spinner';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#07090f]">
      <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500">
        <div className="absolute -inset-4 bg-[#31b8c6]/20 blur-2xl rounded-full animate-pulse"></div>
        <img 
          src="/assets/perplexity.png" 
          alt="Perplexity Logo" 
          className="w-20 h-20 rounded-2xl shadow-2xl ring-2 ring-[#31b8c6]/30 relative" 
        />
      </div>
      <div className="flex flex-col items-center gap-4 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-3xl font-['Playfair_Display',serif] tracking-tight text-white mb-2">
           perplexity
        </h2>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-[#3b3d41] bg-[#1a1c1e]/60 backdrop-blur-sm shadow-xl">
           <Spinner size={18} color="#31b8c6" />
           <span className="text-sm font-medium text-gray-400">Loading your workspace...</span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
