import React from 'react';
import { Filter, RotateCcw, DollarSign, Star, Utensils, MapPin } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const FilterSidebar = ({
  cuisines = [],
  cities = [],
  selectedCuisine,
  setSelectedCuisine,
  selectedPrice,
  setSelectedPrice,
  selectedRating,
  setSelectedRating,
  selectedCity,
  setSelectedCity,
  onReset,
}) => {
  const { getPriceTier } = useCurrency();

  const priceLevels = [
    { value: 1, label: `${getPriceTier(1)} (Budget)` },
    { value: 2, label: `${getPriceTier(2)} (Moderate)` },
    { value: 3, label: `${getPriceTier(3)} (Fine Dining)` },
    { value: 4, label: `${getPriceTier(4)} (Luxury)` },
  ];

  const ratingLevels = [
    { value: 0, label: 'All Ratings' },
    { value: 4.5, label: '4.5+ (Exceptional)' },
    { value: 4.0, label: '4.0+ (Very Good)' },
    { value: 3.5, label: '3.5+ (Good)' },
  ];

  const hasActiveFilters =
    selectedCuisine !== 'all' ||
    selectedPrice !== null ||
    selectedRating > 0 ||
    selectedCity !== 'all';

  return (
    <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-base">
          <Filter className="w-4 h-4 text-brand-500" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Cuisine Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          Cuisine Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCuisine('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCuisine === 'all'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Cuisines
          </button>
          {cuisines.map((c) => (
            <button
              key={c.cuisine}
              type="button"
              onClick={() => setSelectedCuisine(c.cuisine)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCuisine === c.cuisine
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c.cuisine} ({c.count})
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          {priceLevels.map((p) => {
            const isSelected = selectedPrice === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelectedPrice(isSelected ? null : p.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          Minimum Score
        </label>
        <div className="space-y-1.5">
          {ratingLevels.map((r) => {
            const isSelected = selectedRating === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRating(r.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{r.label}</span>
                {r.value > 0 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* City Location Filter */}
      {cities.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            City / Location
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.count})
              </option>
            ))}
          </select>
        </div>
      )}
    </aside>
  );
};
