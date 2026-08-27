import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const LoadingFallback = ({ message = "Loading TasteCraft..." }) => {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        {/* Animated pulsing outer rings */}
        <div className="absolute w-20 h-20 rounded-full bg-brand-500/20 animate-ping pointer-events-none" />
        <div className="absolute w-16 h-16 rounded-full bg-brand-500/30 animate-pulse pointer-events-none" />
        
        {/* Brand Icon Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
          <UtensilsCrossed className="w-7 h-7 animate-bounce" />
        </div>
      </div>

      {/* Loading message & progress bar */}
      <div className="mt-6 text-center space-y-2 max-w-xs">
        <p className="text-sm font-bold text-slate-800 tracking-tight">{message}</p>
        <div className="w-36 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-amber-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '80%' }} />
        </div>
      </div>
    </div>
  );
};

