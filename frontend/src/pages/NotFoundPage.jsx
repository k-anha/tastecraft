import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Search, ArrowLeft, UtensilsCrossed, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Visual Badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-500/10 via-amber-500/10 to-rose-500/10 border border-brand-200/50 flex items-center justify-center mx-auto text-brand-600 shadow-inner">
            <Compass className="w-12 h-12 stroke-[1.75]" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-xs font-bold shadow-md">
            404
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif-brand tracking-tight">
            Page or Resource Not Found
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The link you followed or the URL you entered (<code className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs break-all">{location.pathname}</code>) does not exist or may have been moved.
          </p>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Link
            to="/"
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 bg-white text-left transition-all group shadow-sm flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition-colors flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">Homepage</p>
              <p className="text-[11px] text-slate-500">Back to main dashboard</p>
            </div>
          </Link>

          <Link
            to="/explore"
            className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 bg-white text-left transition-all group shadow-sm flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition-colors flex-shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">Explore Dining</p>
              <p className="text-[11px] text-slate-500">Discover top restaurants</p>
            </div>
          </Link>
        </div>

        {/* Direct Action Button */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
