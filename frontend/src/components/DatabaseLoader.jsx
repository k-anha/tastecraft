import React from 'react';
import { Database, UtensilsCrossed, Sparkles } from 'lucide-react';

export const DatabaseLoader = ({ message = "Fetching data from database...", subtitle = "Loading real-time reviews, menus & dining insights" }) => {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4">
      {/* Animated Glowing Icon */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulsing rings */}
        <div className="absolute w-20 h-20 rounded-full bg-brand-500/15 animate-ping" />
        <div className="absolute w-16 h-16 rounded-full bg-amber-500/20 animate-pulse" />
        
        {/* Central Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
          <UtensilsCrossed className="w-7 h-7 animate-bounce" />
        </div>
      </div>

      {/* Message and Indicator */}
      <div className="space-y-2 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm">
          <Database className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span>Database Query Active</span>
        </div>
        <h4 className="text-base font-bold text-slate-900 font-serif-brand">
          {message}
        </h4>
        <p className="text-xs text-slate-500">
          {subtitle}
        </p>

        {/* Shimmer Bar */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500 rounded-full animate-pulse" style={{ width: '85%' }} />
        </div>
      </div>
    </div>
  );
};

