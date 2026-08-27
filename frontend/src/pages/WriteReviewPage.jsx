import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, Utensils, DollarSign, HeartHandshake, Sparkles, 
  Image, Calendar, ArrowLeft, Send, CheckCircle2, AlertCircle, Plus, Trash2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/RatingStars';

const DishTagInput = lazy(() =>
  import('../components/DishTagInput').then((m) => ({ default: m.DishTagInput }))
);

export const WriteReviewPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    restaurantId ? parseInt(restaurantId) : ''
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [foodRating, setFoodRating] = useState(5.0);
  const [priceRating, setPriceRating] = useState(5.0);
  const [serviceRating, setServiceRating] = useState(5.0);
  const [ambianceRating, setAmbianceRating] = useState(5.0);
  const [overallRating, setOverallRating] = useState(5.0);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [dishReviews, setDishReviews] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please sign in to write a review.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (restaurantId) {
          const res = await api.get(`/restaurants/${restaurantId}`);
          setRestaurant(res.data);
          setSelectedRestaurantId(parseInt(restaurantId));
        } else {
          const res = await api.get('/restaurants?limit=50');
          setAllRestaurants(res.data);
          if (res.data.length > 0) {
            setSelectedRestaurantId(res.data[0].id);
            const rDetail = await api.get(`/restaurants/${res.data[0].id}`);
            setRestaurant(rDetail.data);
          }
        }
      } catch (err) {
        showError('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, isAuthenticated]);

  // Automatically compute suggested overall score whenever sub-criteria change
  const updateCriteriaRating = (type, val) => {
    let f = foodRating;
    let p = priceRating;
    let s = serviceRating;
    let a = ambianceRating;

    if (type === 'food') { setFoodRating(val); f = val; }
    if (type === 'price') { setPriceRating(val); p = val; }
    if (type === 'service') { setServiceRating(val); s = val; }
    if (type === 'ambiance') { setAmbianceRating(val); a = val; }

    const avg = parseFloat(((f + p + s + a) / 4).toFixed(1));
    setOverallRating(avg);
  };

  const handleRestaurantSelectChange = async (e) => {
    const rId = parseInt(e.target.value);
    setSelectedRestaurantId(rId);
    try {
      const res = await api.get(`/restaurants/${rId}`);
      setRestaurant(res.data);
      setDishReviews([]); // reset dish tags for new restaurant
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) {
      showError('Please select a restaurant to review.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showError('Please provide both a review headline and detailed story.');
      return;
    }

    setSubmitting(true);
    try {
      const validImages = imageUrls.filter((u) => u.trim().startsWith('http'));
      const payload = {
        restaurant_id: selectedRestaurantId,
        title: title.trim(),
        content: content.trim(),
        food_rating: foodRating,
        price_rating: priceRating,
        service_rating: serviceRating,
        ambiance_rating: ambianceRating,
        overall_rating: overallRating,
        visit_date: visitDate,
        images: validImages.length > 0 ? JSON.stringify(validImages) : null,
        dish_reviews: dishReviews,
      };

      await api.post('/reviews', payload);
      showSuccess('Your review and tasting comments have been published!');
      navigate(`/restaurants/${selectedRestaurantId}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit review.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back Button */}
      <Link
        to={restaurant ? `/restaurants/${restaurant.id}` : '/explore'}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {restaurant?.name || 'Explore'}</span>
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif-brand text-3xl font-bold text-slate-900">
          Write a Multi-Criteria Review
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Share your candid evaluation across food quality, price, service, ambiance, and specific dishes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Restaurant Picker if not from detail page */}
        {!restaurantId && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Restaurant
            </label>
            <select
              value={selectedRestaurantId}
              onChange={handleRestaurantSelectChange}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {allRestaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.cuisine_type} - {r.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multi-Criteria Ratings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">
              1. Evaluate the 4 Core Dimensions
            </h3>
            <p className="text-xs text-slate-500">Click to set 1-5 stars for each category.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Food Quality */}
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Utensils className="w-4 h-4 text-orange-600" />
                  Food Quality
                </span>
                <span className="text-sm font-extrabold text-orange-950">{foodRating.toFixed(1)} / 5</span>
              </div>
              <RatingStars
                rating={foodRating}
                interactive
                onChange={(val) => updateCriteriaRating('food', val)}
                size="lg"
              />
              <p className="text-[11px] text-slate-500">Taste, freshness, seasoning, and temperature.</p>
            </div>

            {/* Value & Price */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Value & Price
                </span>
                <span className="text-sm font-extrabold text-emerald-950">{priceRating.toFixed(1)} / 5</span>
              </div>
              <RatingStars
                rating={priceRating}
                interactive
                onChange={(val) => updateCriteriaRating('price', val)}
                size="lg"
              />
              <p className="text-[11px] text-slate-500">Portion size and quality compared to menu cost.</p>
            </div>

            {/* Service */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  Service Quality
                </span>
                <span className="text-sm font-extrabold text-blue-950">{serviceRating.toFixed(1)} / 5</span>
              </div>
              <RatingStars
                rating={serviceRating}
                interactive
                onChange={(val) => updateCriteriaRating('service', val)}
                size="lg"
              />
              <p className="text-[11px] text-slate-500">Attentiveness, warmth, speed, and hospitality.</p>
            </div>

            {/* Ambiance */}
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Ambiance & Vibe
                </span>
                <span className="text-sm font-extrabold text-purple-950">{ambianceRating.toFixed(1)} / 5</span>
              </div>
              <RatingStars
                rating={ambianceRating}
                interactive
                onChange={(val) => updateCriteriaRating('ambiance', val)}
                size="lg"
              />
              <p className="text-[11px] text-slate-500">Lighting, noise level, seating, and atmosphere.</p>
            </div>
          </div>

          {/* Overall Score Calculated Badge */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Overall Rating</span>
                <p className="text-xs text-slate-600">Calculated average of your 4 scores above</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-900">{overallRating.toFixed(1)}</span>
              <span className="text-xs text-amber-700 font-semibold"> / 5.0</span>
            </div>
          </div>
        </div>

        {/* Written Review Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              2. Share Your Dining Story
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unbelievable Truffle Pasta & Fantastic Wine Pairing!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Review *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe your meal, portion sizes, flavors, seating experience, and staff recommendations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date of Visit
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Dish-Specific Reviews & Tasting Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              3. Specific Food & Dish Comments
            </h3>
            <p className="text-xs text-slate-500">
              Did you try particular dishes? Tag them and leave detailed tasting notes for fellow foodies.
            </p>
          </div>

          <Suspense fallback={<div className="p-4 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl animate-pulse">Loading dish comment tools...</div>}>
            <DishTagInput
              dishes={dishReviews}
              onChange={setDishReviews}
              availableMenuItems={restaurant?.menu_items || []}
            />
          </Suspense>
        </div>

        {/* Food Photos URLs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Image className="w-4 h-4 text-brand-500" />
                4. Food Photos (Optional)
              </h3>
              <p className="text-xs text-slate-500">Paste direct image URLs of your food or table.</p>
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Photo URL
            </button>
          </div>

          <div className="space-y-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={url}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                  className="flex-1 text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="text-slate-400 hover:text-rose-500 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={restaurant ? `/restaurants/${restaurant.id}` : '/explore'}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-extrabold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Publishing Review...' : 'Publish Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

