import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Bookmark, Star, Edit3, Settings, ShieldCheck, 
  Utensils, Heart, Calendar, CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'reviews');
  const [myReviews, setMyReviews] = useState([]);
  const [savedRestaurants, setSavedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [acceptsPromotions, setAcceptsPromotions] = useState(user?.accepts_promotions ?? true);

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please sign in to view your profile.');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [revRes, bookRes] = await Promise.all([
          api.get(`/reviews/user/${user.id}`),
          api.get('/bookmarks'),
        ]);
        setMyReviews(revRes.data);
        setSavedRestaurants(bookRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
      setFullName(user.full_name || '');
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

  const handleBookmarkToggle = (restaurantId, newStatus) => {
    if (!newStatus) {
      setSavedRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.full_name || user.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500 shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-900">
                  {user.full_name || user.username}
                </h1>
                {user.role === 'owner' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Restaurant Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                @{user.username} • {user.email} {user.phone_number && `• ${user.country_code || ''} ${user.phone_number}`}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.accepts_promotions ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {user.accepts_promotions ? 'Promotions & SMS Active' : 'Promotions Disabled'}
                </span>
              </div>
              {user.bio && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl pt-1 leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Form Drawer */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Number (Digits only)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210 (digits without spaces)"
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Password (optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bio / Culinary Preferences
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about your favorite cuisines and dishes..."
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptsPromotions}
                    onChange={(e) => setAcceptsPromotions(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Receive foodie promotions, deals, and restaurant recommendations via Email and SMS
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-50"
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
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => handleTabSwitch('reviews')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>My Written Reviews</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {myReviews.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('bookmarks')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Restaurants</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {savedRestaurants.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <DatabaseLoader message="Fetching your profile data..." subtitle="Loading your personalized reviews and bookmarks from database" />
        </div>
      ) : activeTab === 'reviews' ? (
        myReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
            <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800">You haven't written any reviews yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
            <Suspense fallback={<div className="space-y-4"><div className="h-44 bg-slate-100 rounded-2xl animate-pulse" /><div className="h-44 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
              {myReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </Suspense>
          </div>
        )
      ) : savedRestaurants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800">No saved restaurants yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any restaurant card to save it for your next dining outing.
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
          <Suspense fallback={<div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />}>
            {savedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onBookmarkChange={handleBookmarkToggle}
              />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  );
};

