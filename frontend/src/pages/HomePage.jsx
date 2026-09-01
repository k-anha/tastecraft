import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Utensils, Star, DollarSign, HeartHandshake, Sparkles, 
  ArrowRight, Flame, MapPin, Award, CheckCircle2, TrendingUp 
} from 'lucide-react';
import api from '../services/api';
import { RatingStars } from '../components/RatingStars';
import { DatabaseLoader } from '../components/DatabaseLoader';

const RestaurantCard = lazy(() =>
  import('../components/RestaurantCard').then((m) => ({ default: m.RestaurantCard }))
);
const ReviewCard = lazy(() =>
  import('../components/ReviewCard').then((m) => ({ default: m.ReviewCard }))
);

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, revRes, cuisRes] = await Promise.all([
          api.get('/restaurants?sort_by=highest_rated&limit=6'),
          api.get('/reviews/recent?limit=4'),
          api.get('/restaurants/cuisines')
        ]);
        setTopRestaurants(restRes.data);
        setRecentReviews(revRes.data);
        setCuisines(cuisRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const quickCuisines = [
    { name: 'Italian', icon: '🍝', bg: 'bg-amber-100 text-amber-900' },
    { name: 'Japanese', icon: '🍜', bg: 'bg-rose-100 text-rose-900' },
    { name: 'Mexican', icon: '🌮', bg: 'bg-emerald-100 text-emerald-900' },
    { name: 'Indian', icon: '🍛', bg: 'bg-orange-100 text-orange-900' },
    { name: 'American BBQ', icon: '🍖', bg: 'bg-red-100 text-red-900' },
    { name: 'French', icon: '🥐', bg: 'bg-blue-100 text-blue-900' },
    { name: 'Vegan / Healthy', icon: '🥗', bg: 'bg-green-100 text-green-900' },
    { name: 'Cafe & Bakery', icon: '☕', bg: 'bg-purple-100 text-purple-900' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-amber-50/40 to-slate-50 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-900 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Flame className="w-4 h-4 text-brand-600 animate-pulse" />
              The Multi-Criteria Restaurant Review Platform
            </div>

            <h1 className="font-serif-brand text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Real Food. Honest Ratings. <br />
              <span className="bg-gradient-to-r from-brand-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                Every Dish Detailed.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Don't settle for generic 1-to-5 star averages. Discover restaurants evaluated across 
              <strong> Food Quality</strong>, <strong>Value & Prices</strong>, <strong>Service</strong>, and <strong>Ambiance</strong> with item-by-item tasting comments.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-white rounded-2xl sm:rounded-full border border-slate-300/80 shadow-xl shadow-brand-950/5 max-w-2xl mx-auto"
            >
              <div className="flex items-center flex-1 w-full pl-3 pr-2">
                <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, or specific dishes (e.g. Birria, Truffle, Ramen)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Find Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Cuisines Quick Pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Trending:</span>
              {quickCuisines.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => navigate(`/explore?cuisine=${encodeURIComponent(c.name)}`)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:scale-105 transition-all ${c.bg} shadow-sm`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Rating Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              The TasteCraft Difference
            </span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold">
              Multi-Dimensional Review Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              A restaurant might have incredible food but sluggish service, or great ambiance with overpriced portions. We break it down so you know before you go:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">1. Food Quality</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flavor depth, ingredient freshness, culinary technique, and authentic execution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">2. Value & Prices</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Portion size relative to cost, fair menu pricing, and overall satisfaction for your wallet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">3. Service Quality</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Attentiveness, table pacing, warmth of staff, accuracy, and hospitality standard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">4. Ambiance & Vibe</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lighting, decor, noise level, seating comfort, cleanliness, and overall mood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Top Rated Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Top Rated by Foodies
            </div>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Highest-Rated Dining Spots
            </h2>
          </div>
          <Link
            to="/explore?sort=highest_rated"
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All Restaurants</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <DatabaseLoader message="Fetching highest-rated dining spots..." subtitle="Querying verified foodie ratings and scores from database" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-80 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
              {topRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </Suspense>
          </div>
        )}
      </section>

      {/* Recent Reviews & Dish Tasting Notes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              Community Feed
            </div>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Latest Food Reviews & Tasting Notes
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Browse More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-60 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-60 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
              {recentReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </Suspense>
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-amber-600 p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-serif-brand text-2xl sm:text-4xl font-bold text-white">
              Had an amazing meal recently?
            </h3>
            <p className="text-sm text-brand-100 leading-relaxed">
              Share your review with our community. Rate the food, price, and service, and give your tasting verdict on your favorite dishes.
            </p>
          </div>
          <Link
            to="/add-restaurant"
            className="px-6 py-3.5 rounded-full bg-white text-brand-700 hover:bg-brand-50 text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex-shrink-0"
          >
            Add a Restaurant & Review
          </Link>
        </div>
      </section>
    </div>
  );
};

