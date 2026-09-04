import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, MapPin, Utensils, DollarSign, HeartHandshake } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

export const RestaurantCard = ({ restaurant, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { getPriceTier } = useCurrency();
  const [isBookmarked, setIsBookmarked] = useState(restaurant.is_bookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const priceSymbols = getPriceTier(restaurant.price_range || 2);
  const stats = restaurant.stats || {};
  const overall = stats.avg_overall_rating || 0;

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showInfo('Please sign in to save your favorite restaurants.');
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await api.post(`/bookmarks/toggle/${restaurant.id}`);
      setIsBookmarked(res.data.is_bookmarked);
      showSuccess(res.data.message);
      if (onBookmarkChange) onBookmarkChange(restaurant.id, res.data.is_bookmarked);
    } catch (err) {
      showError('Failed to update bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
            {restaurant.cuisine_type}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-xs font-bold tracking-wider">
            {priceSymbols}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          disabled={bookmarkLoading}
          aria-label="Save restaurant"
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-md active:scale-95"
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              isBookmarked ? 'fill-brand-500 text-brand-500' : 'text-slate-600 dark:text-slate-300'
            }`}
          />
        </button>

        {/* Overall Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-100/30 dark:border-slate-800">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {overall > 0 ? overall.toFixed(1) : 'New'}
          </span>
          {stats.review_count > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({stats.review_count})</span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif-brand text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="line-clamp-1">{restaurant.address}, {restaurant.city}</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        </div>

        {/* Multi-Criteria Ratings Pill Grid */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-orange-50/70 dark:bg-orange-950/30 p-1.5 rounded-lg border border-orange-100/50 dark:border-orange-900/20">
            <span className="block text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">Food</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {stats.avg_food_rating > 0 ? stats.avg_food_rating.toFixed(1) : '-'}
            </span>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
            <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Value</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {stats.avg_price_rating > 0 ? stats.avg_price_rating.toFixed(1) : '-'}
            </span>
          </div>
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-1.5 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
            <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Service</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {stats.avg_service_rating > 0 ? stats.avg_service_rating.toFixed(1) : '-'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
