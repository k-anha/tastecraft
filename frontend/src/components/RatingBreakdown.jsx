import React from 'react';
import { Utensils, DollarSign, HeartHandshake, Sparkles, Star } from 'lucide-react';
import { RatingStars } from './RatingStars';

export const RatingBreakdown = ({ stats, compact = false }) => {
  if (!stats) return null;

  const criteria = [
    {
      name: 'Food Quality',
      score: stats.avg_food_rating || 0,
      icon: Utensils,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgLight: 'bg-orange-50 dark:bg-orange-950/40',
    },
    {
      name: 'Value for Money',
      score: stats.avg_price_rating || 0,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      name: 'Service Quality',
      score: stats.avg_service_rating || 0,
      icon: HeartHandshake,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      name: 'Atmosphere & Vibe',
      score: stats.avg_ambiance_rating || 0,
      icon: Sparkles,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {criteria.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${item.bgLight} border border-slate-100/50 dark:border-slate-800`}>
              <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  {item.name.split(' ')[0]}
                </span>
                <span className={`text-xs font-bold ${item.textColor}`}>
                  {item.score > 0 ? item.score.toFixed(1) : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-amber-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-md shadow-brand-500/20">
            <span className="text-3xl font-extrabold tracking-tight">
              {stats.avg_overall_rating > 0 ? stats.avg_overall_rating.toFixed(1) : '0.0'}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">out of 5</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Community Verdict</h3>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={stats.avg_overall_rating} size="md" />
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                ({stats.review_count} {stats.review_count === 1 ? 'verified review' : 'verified reviews'})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {criteria.map((item) => {
          const Icon = item.icon;
          const percentage = (item.score / 5) * 100;
          return (
            <div key={item.name} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${item.bgLight}`}>
                    <Icon className={`w-4 h-4 ${item.textColor}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {item.score > 0 ? item.score.toFixed(1) : '-'} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 5.0</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
