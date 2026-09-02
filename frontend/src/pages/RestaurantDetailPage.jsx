import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Phone, Globe, Clock, Bookmark, Edit3, 
  Utensils, CheckCircle2, ChevronRight, Share2, Sparkles, 
  DollarSign, HeartHandshake, ShieldCheck, Tag, Trash2, Plus, X, Image, AlertCircle, Edit2, Settings 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { RatingStars } from '../components/RatingStars';
import { DatabaseLoader } from '../components/DatabaseLoader';

const RatingBreakdown = lazy(() =>
  import('../components/RatingBreakdown').then((m) => ({ default: m.RatingBreakdown }))
);
const ReviewCard = lazy(() =>
  import('../components/ReviewCard').then((m) => ({ default: m.ReviewCard }))
);

export const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { formatPrice, getPriceTier, currencySymbol } = useCurrency();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews'
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Edit Restaurant Details Modal State (Owner/Admin)
  const [editRestaurantModalOpen, setEditRestaurantModalOpen] = useState(false);
  const [editRestName, setEditRestName] = useState('');
  const [editRestDesc, setEditRestDesc] = useState('');
  const [editRestCuisine, setEditRestCuisine] = useState('');
  const [editRestPriceRange, setEditRestPriceRange] = useState(2);
  const [editRestAddress, setEditRestAddress] = useState('');
  const [editRestCity, setEditRestCity] = useState('');
  const [editRestState, setEditRestState] = useState('');
  const [editRestZip, setEditRestZip] = useState('');
  const [editRestPhone, setEditRestPhone] = useState('');
  const [editRestWebsite, setEditRestWebsite] = useState('');
  const [editRestHours, setEditRestHours] = useState('');
  const [editRestImageUrl, setEditRestImageUrl] = useState('');
  const [editRestCoverImageUrl, setEditRestCoverImageUrl] = useState('');
  const [editRestFeatures, setEditRestFeatures] = useState('');
  const [savingRestaurantEdit, setSavingRestaurantEdit] = useState(false);

  // Add Dish Modal State (Open to ANY authenticated user)
  const [addDishModalOpen, setAddDishModalOpen] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Mains');
  const [dishPrice, setDishPrice] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishIsSignature, setDishIsSignature] = useState(false);
  const [dishSubmitting, setDishSubmitting] = useState(false);

  // Edit Dish Modal State (Owner/Admin)
  const [editDishModalOpen, setEditDishModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishCategory, setEditDishCategory] = useState('Mains');
  const [editDishPrice, setEditDishPrice] = useState('');
  const [editDishDescription, setEditDishDescription] = useState('');
  const [editDishImageUrl, setEditDishImageUrl] = useState('');
  const [editDishIsSignature, setEditDishIsSignature] = useState(false);
  const [editDishSubmitting, setEditDishSubmitting] = useState(false);

  // Deleting State
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);

  const fetchRestaurantData = async () => {
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

  useEffect(() => {
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

  // Open Edit Restaurant Modal
  const handleStartEditRestaurant = () => {
    if (!restaurant) return;
    setEditRestName(restaurant.name || '');
    setEditRestDesc(restaurant.description || '');
    setEditRestCuisine(restaurant.cuisine_type || 'Italian');
    setEditRestPriceRange(restaurant.price_range || 2);
    setEditRestAddress(restaurant.address || '');
    setEditRestCity(restaurant.city || '');
    setEditRestState(restaurant.state || '');
    setEditRestZip(restaurant.zip_code || '');
    setEditRestPhone(restaurant.phone_number || '');
    setEditRestWebsite(restaurant.website || '');
    setEditRestHours(restaurant.opening_hours || '');
    setEditRestImageUrl(restaurant.image_url || '');
    setEditRestCoverImageUrl(restaurant.cover_image_url || '');
    setEditRestFeatures(restaurant.features || '');
    setEditRestaurantModalOpen(true);
  };

  // Save Edited Restaurant Details (Owner / Admin)
  const handleSaveRestaurantSubmit = async (e) => {
    e.preventDefault();
    if (!editRestName.trim() || !editRestDesc.trim() || !editRestAddress.trim() || !editRestCity.trim()) {
      showError('Please provide name, description, address and city.');
      return;
    }

    setSavingRestaurantEdit(true);
    try {
      const payload = {
        name: editRestName.trim(),
        description: editRestDesc.trim(),
        cuisine_type: editRestCuisine.trim(),
        price_range: editRestPriceRange,
        address: editRestAddress.trim(),
        city: editRestCity.trim(),
        state: editRestState.trim() || null,
        zip_code: editRestZip.trim() || null,
        phone_number: editRestPhone.trim() || null,
        website: editRestWebsite.trim() || null,
        opening_hours: editRestHours.trim() || null,
        image_url: editRestImageUrl.trim() || null,
        cover_image_url: editRestCoverImageUrl.trim() || null,
        features: editRestFeatures.trim() || null,
      };

      await api.put(`/restaurants/${id}`, payload);
      showSuccess(`"${editRestName}" details updated successfully!`);
      setEditRestaurantModalOpen(false);
      fetchRestaurantData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update restaurant details.');
    } finally {
      setSavingRestaurantEdit(false);
    }
  };

  // Add Food Item (Open to ALL authenticated users)
  const handleAddDishSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showInfo('Please sign in to contribute food items and images.');
      navigate('/login');
      return;
    }
    if (!dishName.trim() || !dishPrice) {
      showError('Please provide a dish name and price.');
      return;
    }

    setDishSubmitting(true);
    try {
      const payload = {
        name: dishName.trim(),
        category: dishCategory,
        price: parseFloat(dishPrice),
        description: dishDescription.trim() || null,
        image_url: dishImageUrl.trim() || null,
        is_signature: dishIsSignature,
      };

      await api.post(`/restaurants/${id}/menu`, payload);
      showSuccess(`"${dishName}" added to the digital menu!`);
      setDishName('');
      setDishPrice('');
      setDishDescription('');
      setDishImageUrl('');
      setDishIsSignature(false);
      setAddDishModalOpen(false);
      fetchRestaurantData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to add dish item.');
    } finally {
      setDishSubmitting(false);
    }
  };

  // Open Edit Dish Modal
  const handleStartEditDish = (item) => {
    setEditingDishId(item.id);
    setEditDishName(item.name);
    setEditDishCategory(item.category || 'Mains');
    setEditDishPrice(item.price ? String(item.price) : '');
    setEditDishDescription(item.description || '');
    setEditDishImageUrl(item.image_url || '');
    setEditDishIsSignature(item.is_signature || false);
    setEditDishModalOpen(true);
  };

  // Save Edited Food Item (Owner / Admin)
  const handleSaveEditDishSubmit = async (e) => {
    e.preventDefault();
    if (!editDishName.trim() || !editDishPrice) {
      showError('Please provide a dish name and price.');
      return;
    }

    setEditDishSubmitting(true);
    try {
      const payload = {
        name: editDishName.trim(),
        category: editDishCategory,
        price: parseFloat(editDishPrice),
        description: editDishDescription.trim() || null,
        image_url: editDishImageUrl.trim() || null,
        is_signature: editDishIsSignature,
      };

      await api.put(`/restaurants/${id}/menu/${editingDishId}`, payload);
      showSuccess(`"${editDishName}" updated successfully!`);
      setEditDishModalOpen(false);
      fetchRestaurantData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update dish.');
    } finally {
      setEditDishSubmitting(false);
    }
  };

  // Delete Food Item (Owner / Admin)
  const handleDeleteMenuItem = async (menuItemId, menuItemName) => {
    if (!window.confirm(`Are you sure you want to remove "${menuItemName}" from the menu?`)) {
      return;
    }

    try {
      await api.delete(`/restaurants/${id}/menu/${menuItemId}`);
      showSuccess(`"${menuItemName}" removed from menu.`);
      fetchRestaurantData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to remove dish item.');
    }
  };

  // Delete Entire Restaurant (Owner / Admin)
  const handleDeleteRestaurant = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${restaurant.name}"? All reviews, menu items, and photos will be removed permanently.`)) {
      return;
    }

    setDeletingRestaurant(true);
    try {
      await api.delete(`/restaurants/${id}`);
      showSuccess(`"${restaurant.name}" has been deleted.`);
      navigate('/explore');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete restaurant.');
      setDeletingRestaurant(false);
    }
  };

  // Claim Restaurant (Owner)
  const handleClaimRestaurant = async () => {
    try {
      await api.post(`/restaurants/${id}/claim`);
      showSuccess(`Congratulations! You have claimed ownership of "${restaurant.name}".`);
      fetchRestaurantData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to claim restaurant.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <DatabaseLoader message="Fetching restaurant profile & menu..." subtitle="Retrieving digital menu, multi-criteria breakdown & tasting notes from database" />
        </div>
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

  const isOwner = isAuthenticated && (user?.id === restaurant.owner_id || user?.role === 'admin');
  const canClaim = isAuthenticated && user?.role === 'owner' && !restaurant.owner_id;
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
                {isOwner && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> You Own This Listing
                  </span>
                )}
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
              {canClaim && (
                <button
                  onClick={handleClaimRestaurant}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim Ownership</span>
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={handleStartEditRestaurant}
                    className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all backdrop-blur-md"
                    title="Edit restaurant details, location, phone, and photos"
                  >
                    <Edit2 className="w-4 h-4 text-amber-300" />
                    <span>Edit Restaurant Details</span>
                  </button>

                  <button
                    onClick={handleDeleteRestaurant}
                    disabled={deletingRestaurant}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                    title="Delete this restaurant listing"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingRestaurant ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </>
              )}

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
                      Explore house specialties or contribute your favorite dishes and food photos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Add Dish Button (Open to ANY user) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          showInfo('Please sign in to add a dish or food photo.');
                          navigate('/login');
                        } else {
                          setAddDishModalOpen(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Dish / Photo</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
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

                {/* Menu Items Grid */}
                {filteredMenuItems.length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">No menu items listed in this category yet.</p>
                    <button
                      type="button"
                      onClick={() => setAddDishModalOpen(true)}
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      + Be the first to add a dish
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {item.image_url && (
                          <div className="mb-3 rounded-lg overflow-hidden h-32 w-full bg-slate-100">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
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
                          
                          <div className="flex items-center gap-1.5">
                            {isOwner && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditDish(item)}
                                  className="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                  title="Edit food item & photo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenuItem(item.id, item.name)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete food item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <Link
                              to={`/write-review/${restaurant.id}`}
                              className="text-brand-600 hover:underline font-bold ml-1"
                            >
                              Review Dish →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Rating Breakdown Card */}
            <div className="space-y-6">
              <Suspense fallback={<div className="h-96 bg-white rounded-2xl border animate-pulse" />}>
                <RatingBreakdown stats={stats} />
              </Suspense>

              {/* Owner Info Card */}
              {restaurant.owner_id ? (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">Verified Restaurant Listing</p>
                      <p className="text-slate-500">Managed directly by official restaurant owner.</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={handleStartEditRestaurant}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm flex-shrink-0"
                    >
                      <Edit2 className="w-3 h-3 text-brand-600" />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-bold">Unclaimed Listing</p>
                    <p className="text-[11px] text-amber-800">Are you the owner of this establishment?</p>
                  </div>
                  {user?.role === 'owner' ? (
                    <button
                      onClick={handleClaimRestaurant}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-sm hover:bg-amber-700 flex-shrink-0"
                    >
                      Claim
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="text-xs font-bold text-amber-900 underline flex-shrink-0"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-brand text-2xl font-bold text-slate-900">
                  Verified Diner Experiences ({reviews.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Real reviews with multi-dimensional breakdowns and dish tasting notes.
                </p>
              </div>

              <Link
                to={`/write-review/${restaurant.id}`}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-base">No reviews yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first gourmet diner to share feedback on food quality, service, value, and ambiance!
                </p>
                <Link
                  to={`/write-review/${restaurant.id}`}
                  className="inline-block px-5 py-2.5 rounded-full bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:bg-brand-600"
                >
                  Write the First Review
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <Suspense fallback={<div className="h-60 bg-slate-100 rounded-2xl animate-pulse" />}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onUpdate={fetchRestaurantData} />
                  ))}
                </Suspense>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Restaurant Details Modal (Owner / Admin) */}
      {editRestaurantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Restaurant Details</h3>
                  <p className="text-[11px] text-slate-500">Update restaurant information, address, contact, and photos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditRestaurantModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurantSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={editRestName}
                    onChange={(e) => setEditRestName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Story *</label>
                  <textarea
                    rows={3}
                    required
                    value={editRestDesc}
                    onChange={(e) => setEditRestDesc(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cuisine Type *</label>
                  <input
                    type="text"
                    required
                    value={editRestCuisine}
                    onChange={(e) => setEditRestCuisine(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price Range Tier</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setEditRestPriceRange(tier)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          editRestPriceRange === tier
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {getPriceTier(tier)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={editRestAddress}
                    onChange={(e) => setEditRestAddress(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={editRestCity}
                    onChange={(e) => setEditRestCity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State / Region</label>
                  <input
                    type="text"
                    value={editRestState}
                    onChange={(e) => setEditRestState(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editRestPhone}
                    onChange={(e) => setEditRestPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={editRestHours}
                    onChange={(e) => setEditRestHours(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={editRestImageUrl}
                    onChange={(e) => setEditRestImageUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Banner Image URL</label>
                  <input
                    type="url"
                    value={editRestCoverImageUrl}
                    onChange={(e) => setEditRestCoverImageUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Features & Amenities (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Outdoor Seating, Free WiFi, Vegan Options, Valet Parking"
                    value={editRestFeatures}
                    onChange={(e) => setEditRestFeatures(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRestaurantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRestaurantEdit}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  {savingRestaurantEdit ? 'Saving Updates...' : 'Save Restaurant Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Food Item / Dish Modal (Open to Anyone) */}
      {addDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add Dish & Food Photo</h3>
                  <p className="text-[11px] text-slate-500">Upload menu items for {restaurant.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddDishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Pork Belly Bao"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price *</label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2.5 text-xs font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="18.5"
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2.5 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dish Photo URL</label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={dishImageUrl}
                    onChange={(e) => setDishImageUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Ingredients</label>
                <textarea
                  rows={2}
                  placeholder="Key flavors, cooking style, or dietary highlights..."
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishIsSignature}
                    onChange={(e) => setDishIsSignature(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Mark as House Signature Dish</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  {dishSubmitting ? 'Uploading...' : 'Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Item / Dish Modal (Owner / Admin) */}
      {editDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Food Item & Photo</h3>
                  <p className="text-[11px] text-slate-500">Update pricing, description, or image</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditDishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={editDishName}
                  onChange={(e) => setEditDishName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editDishCategory}
                    onChange={(e) => setEditDishCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price *</label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2.5 text-xs font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editDishPrice}
                      onChange={(e) => setEditDishPrice(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2.5 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dish Photo URL</label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editDishImageUrl}
                    onChange={(e) => setEditDishImageUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Ingredients</label>
                <textarea
                  rows={2}
                  value={editDishDescription}
                  onChange={(e) => setEditDishDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDishIsSignature}
                    onChange={(e) => setEditDishIsSignature(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Mark as House Signature Dish</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editDishSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  {editDishSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
