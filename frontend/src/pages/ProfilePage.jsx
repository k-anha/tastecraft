import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Bookmark, Star, Edit3, Settings, ShieldCheck, 
  Utensils, Heart, Calendar, CheckCircle2, Building2, Trash2, PlusCircle, MessageSquare, Edit2, Image, X, ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { DatabaseLoader } from '../components/DatabaseLoader';

const ReviewCard = lazy(() =>
  import('../components/ReviewCard').then((m) => ({ default: m.ReviewCard }))
);
const RestaurantCard = lazy(() =>
  import('../components/RestaurantCard').then((m) => ({ default: m.RestaurantCard }))
);

export const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { formatPrice, currencySymbol, toUSD, getRawPriceInCurrency, country } = useCurrency();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'reviews');
  const [myReviews, setMyReviews] = useState([]);
  const [savedRestaurants, setSavedRestaurants] = useState([]);
  const [myOwnedRestaurants, setMyOwnedRestaurants] = useState([]);
  const [myUploadedDishes, setMyUploadedDishes] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [role, setRole] = useState(user?.role || 'user');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [acceptsPromotions, setAcceptsPromotions] = useState(user?.accepts_promotions ?? true);

  // Edit Uploaded Dish Modal State
  const [editDishModalOpen, setEditDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishCategory, setEditDishCategory] = useState('Mains');
  const [editDishPrice, setEditDishPrice] = useState('');
  const [editDishDescription, setEditDishDescription] = useState('');
  const [editDishImageUrl, setEditDishImageUrl] = useState('');
  const [editDishIsSignature, setEditDishIsSignature] = useState(false);
  const [editDishSubmitting, setEditDishSubmitting] = useState(false);

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [revRes, bookRes, restRes, dishRes, comRes] = await Promise.all([
        api.get(`/reviews/user/${user.id}`),
        api.get('/bookmarks'),
        api.get('/restaurants?limit=100'),
        api.get(`/restaurants/menu/user/${user.id}`),
        api.get(`/reviews/comments/user/${user.id}`),
      ]);
      setMyReviews(revRes.data);
      setSavedRestaurants(bookRes.data);
      const owned = restRes.data.filter((r) => r.owner_id === user.id);
      setMyOwnedRestaurants(owned);
      setMyUploadedDishes(dishRes.data);
      setMyComments(comRes.data);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please sign in to view your profile.');
      navigate('/login');
      return;
    }

    if (user?.id) {
      fetchUserData();
      setFullName(user.full_name || '');
      setGender(user.gender || 'Male');
      setRole(user.role || 'user');
      setPhoneNumber(user.phone_number || '');
      setAcceptsPromotions(user.accepts_promotions ?? true);
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user, isAuthenticated]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        gender: gender,
        role: role,
        phone_number: phoneNumber.trim() || null,
        accepts_promotions: acceptsPromotions,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }
      await updateProfile(payload);
      setIsEditing(false);
      setNewPassword('');
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${restaurantName}"? This will remove all menu items and reviews.`)) {
      return;
    }

    try {
      await api.delete(`/restaurants/${restaurantId}`);
      showSuccess(`"${restaurantName}" has been deleted.`);
      fetchUserData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete restaurant.');
    }
  };

  // Dish actions
  const handleStartEditDish = (dish) => {
    setEditingDish(dish);
    setEditDishName(dish.name);
    setEditDishCategory(dish.category || 'Mains');
    setEditDishPrice(dish.price ? getRawPriceInCurrency(dish.price) : '');
    setEditDishDescription(dish.description || '');
    setEditDishImageUrl(dish.image_url || '');
    setEditDishIsSignature(dish.is_signature || false);
    setEditDishModalOpen(true);
  };

  const handleSaveDishSubmit = async (e) => {
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
        price: toUSD(editDishPrice),
        description: editDishDescription.trim() || null,
        image_url: editDishImageUrl.trim() || null,
        is_signature: editDishIsSignature,
      };

      await api.put(`/restaurants/${editingDish.restaurant_id}/menu/${editingDish.id}`, payload);
      showSuccess(`"${editDishName}" updated successfully!`);
      setEditDishModalOpen(false);
      fetchUserData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update dish.');
    } finally {
      setEditDishSubmitting(false);
    }
  };

  const handleDeleteDish = async (restaurantId, dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to remove "${dishName}" from the menu?`)) {
      return;
    }

    try {
      await api.delete(`/restaurants/${restaurantId}/menu/${dishId}`);
      showSuccess(`"${dishName}" removed from menu.`);
      fetchUserData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to remove dish.');
    }
  };

  // Comment actions
  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentContent.trim()) {
      showError('Reply content cannot be empty.');
      return;
    }

    setSavingComment(true);
    try {
      await api.put(`/reviews/comments/${commentId}`, { content: editingCommentContent.trim() });
      showSuccess('Reply updated successfully!');
      setEditingCommentId(null);
      fetchUserData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update reply.');
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await api.delete(`/reviews/comments/${commentId}`);
      showSuccess('Reply deleted.');
      fetchUserData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete reply.');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.full_name || user.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500 shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {user.full_name || user.username}
                </h1>
                {user.role === 'owner' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-transparent dark:border-amber-800/40 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Restaurant Owner
                  </span>
                )}
                {user.gender && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {user.gender}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                @{user.username} • {user.email} {user.phone_number && `• ${user.country_code || ''} ${user.phone_number}`}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.accepts_promotions ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {user.accepts_promotions ? 'Promotions & SMS Active' : 'Promotions Disabled'}
                </span>
              </div>
              {user.bio && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl pt-1 leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Dropdown Panel */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Update Profile Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="user">Food Reviewer</option>
                  <option value="owner">Restaurant Owner (Can list & manage restaurants)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number (Digits only)</label>
                <input
                  type="tel"
                  placeholder="e.g. 2065550143"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Change Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio / Story</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsPromotions}
                    onChange={(e) => setAcceptsPromotions(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-slate-700 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Receive trending food recommendations and community updates via Email and SMS
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => handleTabSwitch('reviews')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'reviews'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>My Reviews</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            {myReviews.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('dishes')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'dishes'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          <span>My Contributed Dishes</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-bold">
            {myUploadedDishes.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('replies')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'replies'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>My Replies</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold">
            {myComments.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('bookmarks')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'bookmarks'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Restaurants</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            {savedRestaurants.length}
          </span>
        </button>

        {user.role === 'owner' && (
          <button
            onClick={() => handleTabSwitch('restaurants')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'restaurants'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span>My Listed Restaurants</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 text-xs font-bold">
              {myOwnedRestaurants.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <DatabaseLoader message="Fetching your profile data..." subtitle="Loading your personalized reviews, contributed dishes, and replies" />
        </div>
      ) : activeTab === 'reviews' ? (
        myReviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
            <Utensils className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">You haven't written any reviews yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Share your dining experiences and rate your favorite dishes to help others discover great meals.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Explore & Write a Review
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <Suspense fallback={<div className="h-60 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
              {myReviews.map((review) => (
                <ReviewCard key={review.id} review={review} onUpdate={fetchUserData} />
              ))}
            </Suspense>
          </div>
        )
      ) : activeTab === 'dishes' ? (
        /* My Contributed Dishes Tab */
        myUploadedDishes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
            <Utensils className="w-10 h-10 text-orange-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">No food items uploaded yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You can upload food dishes and mouthwatering photos to any restaurant's digital menu.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Browse Restaurants & Add Dishes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              You have contributed {myUploadedDishes.length} {myUploadedDishes.length === 1 ? 'dish' : 'dishes'} to community menus
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myUploadedDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  {dish.image_url && (
                    <div className="rounded-xl overflow-hidden h-36 w-full bg-slate-100 dark:bg-slate-800">
                      <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">{dish.name}</h4>
                      <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">{formatPrice(dish.price)}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>Restaurant:</span>
                      <Link
                        to={`/restaurants/${dish.restaurant_id}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        {dish.restaurant_name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {dish.category}
                      </span>
                      {dish.is_signature && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/40 text-[10px] font-bold">
                          Signature Dish
                        </span>
                      )}
                    </div>

                    {dish.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">"{dish.description}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStartEditDish(dish)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Edit this dish"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Edit Dish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDish(dish.restaurant_id, dish.id, dish.name)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Delete this dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : activeTab === 'replies' ? (
        /* My Replies & Discussion Comments Tab */
        myComments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
            <MessageSquare className="w-10 h-10 text-blue-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">No replies written yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Join discussions and reply to customer tasting reviews on restaurants you know.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Explore Reviews
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              You have posted {myComments.length} {myComments.length === 1 ? 'reply' : 'replies'}
            </p>
            <div className="space-y-4">
              {myComments.map((com) => (
                <div
                  key={com.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">On Review:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">"{com.review_title}"</span>
                      <span className="text-slate-400">•</span>
                      <Link
                        to={`/restaurants/${com.restaurant_id}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-bold flex items-center gap-1"
                      >
                        {com.restaurant_name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(com.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {editingCommentId === com.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditComment(com.id)}
                          disabled={savingComment}
                          className="px-4 py-1 rounded-lg bg-brand-500 text-white text-xs font-bold shadow-sm"
                        >
                          {savingComment ? 'Saving...' : 'Save Update'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex-1">
                        {com.content}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(com.id);
                            setEditingCommentContent(com.content);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                          title="Edit your reply"
                        >
                          <Edit2 className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                          <span className="hidden sm:inline text-[11px]">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(com.id)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1"
                          title="Delete your reply"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline text-[11px]">Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ) : activeTab === 'bookmarks' ? (
        savedRestaurants.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
            <Bookmark className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">No saved restaurants</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Browse dining spots and bookmark your dream culinary destinations to build your bucket list.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Discover Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
              {savedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </Suspense>
          </div>
        )
      ) : (
        /* Owner Listed Restaurants Tab */
        myOwnedRestaurants.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
            <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">No restaurants listed under your name</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              As a restaurant owner, you can list your establishment to showcase your digital menu and receive verified reviews.
            </p>
            <Link
              to="/add-restaurant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a New Restaurant</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Managing {myOwnedRestaurants.length} {myOwnedRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'}
              </p>
              <Link
                to="/add-restaurant"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-sm hover:bg-brand-600"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Another Restaurant</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOwnedRestaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{rest.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rest.cuisine_type} • {rest.city}, {rest.address}</p>
                      {rest.phone_number && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Contact: {rest.phone_number}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      Active Listing
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/restaurants/${rest.id}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View & Manage →
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/restaurants/${rest.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Edit restaurant details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>Edit Details</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Permanently delete restaurant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Edit Contributed Dish Modal */}
      {editDishModalOpen && editingDish && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Edit Contributed Food Item</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update dish info for {editingDish.restaurant_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditDishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={editDishName}
                  onChange={(e) => setEditDishName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={editDishCategory}
                    onChange={(e) => setEditDishCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Price *</label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2.5 text-xs font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step={country?.decimals === 0 ? "1" : "0.01"}
                      required
                      placeholder={country?.currency === 'INR' ? '250' : country?.currency === 'JPY' ? '1200' : '18.50'}
                      value={editDishPrice}
                      onChange={(e) => setEditDishPrice(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-7 pr-3 py-2.5 text-slate-800 dark:text-slate-100 font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Dish Photo URL</label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editDishImageUrl}
                    onChange={(e) => setEditDishImageUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Description & Ingredients</label>
                <textarea
                  rows={2}
                  value={editDishDescription}
                  onChange={(e) => setEditDishDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDishIsSignature}
                    onChange={(e) => setEditDishIsSignature(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-slate-700 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mark as House Signature Dish</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
