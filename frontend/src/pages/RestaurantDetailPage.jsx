import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Phone, Globe, Clock, Bookmark, Edit3, 
  Utensils, CheckCircle2, ChevronRight, Share2, Sparkles, 
  DollarSign, HeartHandshake, ShieldCheck, Tag
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { RatingStars } from '../components/RatingStars';

const RatingBreakdown = lazy(() =>
  import('../components/RatingBreakdown').then((m) => ({ default: m.RatingBreakdown }))
);
const ReviewCard = lazy(() =>
  import('../components/ReviewCard').then((m) => ({ default: m.ReviewCard }))
);

export const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews' | 'menu'
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);
      try {
        const [restRes, revRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/reviews/restaurant/${id}`),
        ]);
        setRestaurant(restRes.data);
        setIsBookmarked(restRes.data.is_bookmarked || false);
        setReviews(revRes.data);
      } catch (err) {
        console.error('Failed to load restaurant detail:', err);
        showError('Could not find the requested restaurant.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      showInfo('Please sign in to bookmark this restaurant.');
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await api.post(`/bookmarks/toggle/${id}`);
      setIsBookmarked(res.data.is_bookmarked);
      showSuccess(res.data.message);
    } catch (err) {
      showError('Failed to update bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Restaurant link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Restaurant Not Found</h2>
        <Link to="/explore" className="text-brand-600 underline font-semibold">
          Return to Explore
        </Link>
      </div>
    );
  }

  const { formatPrice, getPriceTier } = useCurrency();
  const priceSymbols = getPriceTier(restaurant.price_range || 2);
  const stats = restaurant.stats || {};
  const menuItems = restaurant.menu_items || [];

  // Menu categories
  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];
  const filteredMenuItems =
    selectedMenuCategory === 'All'
      ? menuItems
      : menuItems.filter((m) => m.category === selectedMenuCategory);

  // Features list
  const featuresList = restaurant.features
    ? restaurant.features.split(',').map((f) => f.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header Banner */}
      <section className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <img
            src={restaurant.cover_image_url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/explore" className="hover:text-white transition-colors">Restaurants</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-200 font-semibold">{restaurant.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  {restaurant.cuisine_type}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wider">
                  Price: {priceSymbols}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {restaurant.city}, {restaurant.state || ''}
                </span>
              </div>

              <h1 className="font-serif-brand text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {restaurant.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {restaurant.description}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                {restaurant.opening_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{restaurant.opening_hours}</span>
                  </div>
                )}
                {restaurant.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{restaurant.phone_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0">
              <button
                onClick={handleToggleBookmark}
                disabled={bookmarkLoading}
                className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-md shadow-md ${
                  isBookmarked
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                <span>{isBookmarked ? 'Saved in Favorites' : 'Save Restaurant'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all backdrop-blur-md"
                title="Share restaurant"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <Link
                to={`/write-review/${restaurant.id}`}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                <span>Write a Review</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Menu
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {reviews.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Menu & Features */}
            <div className="lg:col-span-2 space-y-8">
              {/* Features & Atmosphere Badges */}
              {featuresList.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    Highlights & Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {featuresList.map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-bold text-slate-900">
                      Signature Dishes & Menu
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Explore house specialties and customer favorites.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedMenuCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          selectedMenuCategory === cat
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                {filteredMenuItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No menu items listed in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {item.name}
                            </h4>
                            <span className="font-extrabold text-brand-600 text-sm flex-shrink-0">
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          {item.is_signature && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              House Signature
                            </span>
                          )}

                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed pt-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium">{item.category}</span>
                          <Link
                            to={`/write-review/${restaurant.id}`}
                            className="text-brand-600 hover:underline font-bold"
                          >
                            Review Dish →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Scorecard & Quick Review CTA */}
            <div className="space-y-6">
              <Suspense fallback={<div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />}>
                <RatingBreakdown stats={stats} />
              </Suspense>

              {/* Review CTA Box */}
              <div className="bg-gradient-to-br from-brand-50 to-amber-50 rounded-2xl border border-brand-200/60 p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/30">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">Visited {restaurant.name}?</h4>
                  <p className="text-xs text-slate-600">
                    Help other diners by scoring the food, prices, service, and your favorite dishes!
                  </p>
                </div>
                <Link
                  to={`/write-review/${restaurant.id}`}
                  className="w-full inline-block py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all"
                >
                  Write a Multi-Criteria Review
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Suspense fallback={<div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />}>
                <RatingBreakdown stats={stats} />
              </Suspense>
              
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Have you dined here?</h4>
                <p className="text-xs text-slate-500">
                  Your feedback helps the culinary community discover the best food in town.
                </p>
                <Link
                  to={`/write-review/${restaurant.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Write Review
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-brand text-2xl font-bold text-slate-900">
                  Verified Reviews ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                  <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">No reviews yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Be the first food enthusiast to share your thoughts on the food, prices, and service at {restaurant.name}.
                  </p>
                  <Link
                    to={`/write-review/${restaurant.id}`}
                    className="inline-block px-5 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md"
                  >
                    Write First Review
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <Suspense fallback={<div className="space-y-4"><div className="h-44 bg-slate-100 rounded-2xl animate-pulse" /><div className="h-44 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
                    {reviews.map((rev) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))}
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

