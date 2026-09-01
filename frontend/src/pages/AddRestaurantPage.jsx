import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Utensils, MapPin, DollarSign, Image, Clock, 
  Phone, Globe, Plus, Trash2, ArrowLeft, Star, CheckCircle2, ShieldCheck, Sparkles, AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCountry } from '../context/CountryContext';

export const AddRestaurantPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { country, states, getPriceTier, currencySymbol } = useCountry();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');
  const [customCuisine, setCustomCuisine] = useState('');
  const [priceRange, setPriceRange] = useState(2);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(country.defaultCity || 'Seattle');
  const [state, setState] = useState(country.states?.[0] || 'WA');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon-Sun: 11:00 AM - 10:00 PM');
  const [imageUrl, setImageUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [upgradingRole, setUpgradingRole] = useState(false);

  useEffect(() => {
    if (country.defaultCity) setCity(country.defaultCity);
    if (country.states?.[0]) setState(country.states[0]);
  }, [country]);

  // Selected features
  const availableFeatures = [
    'Outdoor Seating',
    'Vegan Options',
    'Gluten-Free Options',
    'Halal Certified',
    'Free High-Speed WiFi',
    'Reservations Recommended',
    'Valet / Free Parking',
    'Craft Cocktail Bar',
    'Pet / Dog Friendly',
    'Takeout & Delivery',
  ];
  const [selectedFeatures, setSelectedFeatures] = useState([
    'Outdoor Seating',
    'Reservations Recommended',
  ]);

  // Initial Menu Items
  const [menuItems, setMenuItems] = useState([
    {
      name: '',
      category: 'Mains',
      price: '',
      description: '',
      is_signature: true,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const toggleFeature = (feat) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { name: '', category: 'Mains', price: '', description: '', is_signature: false },
    ]);
  };

  const handleMenuItemChange = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const handleRemoveMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleUseProfilePhone = () => {
    if (user?.phone_number) {
      setPhoneNumber(`${user.country_code || ''} ${user.phone_number}`.trim());
      showSuccess('Phone number copied from your profile!');
    } else {
      showInfo('No phone number saved in your profile. You can enter one manually below.');
    }
  };

  const handleUpgradeToOwner = async () => {
    setUpgradingRole(true);
    try {
      await updateProfile({ role: 'owner' });
      showSuccess('Account upgraded to Restaurant Owner! You can now publish your listing.');
    } catch (err) {
      showError('Failed to upgrade account role.');
    } finally {
      setUpgradingRole(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showInfo('Please sign in to list a restaurant.');
      navigate('/login');
      return;
    }

    if (user?.role !== 'owner' && user?.role !== 'admin') {
      showError('Only registered restaurant owners can publish a restaurant. Please upgrade your role.');
      return;
    }

    if (!name.trim() || !description.trim() || !address.trim() || !city.trim()) {
      showError('Please fill in all required restaurant details.');
      return;
    }

    setSubmitting(true);
    try {
      const finalCuisine = cuisineType === 'Other' ? customCuisine.trim() : cuisineType;
      
      // Filter valid menu items
      const validMenuItems = menuItems
        .filter((m) => m.name.trim() && m.price)
        .map((m) => ({
          name: m.name.trim(),
          category: m.category,
          price: parseFloat(m.price),
          description: m.description.trim() || null,
          is_signature: m.is_signature,
        }));

      const payload = {
        name: name.trim(),
        description: description.trim(),
        cuisine_type: finalCuisine || 'Contemporary',
        price_range: priceRange,
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || null,
        zip_code: zipCode.trim() || null,
        phone_number: phoneNumber.trim() || null,
        website: website.trim() || null,
        opening_hours: openingHours.trim() || null,
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        cover_image_url: coverImageUrl.trim() || imageUrl.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
        features: selectedFeatures.join(', '),
        menu_items: validMenuItems,
      };

      const res = await api.post('/restaurants', payload);
      showSuccess(`"${res.data.name}" published successfully under your owner profile!`);
      navigate(`/restaurants/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create restaurant listing.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const commonCuisines = [
    'Italian', 'Japanese', 'Mexican', 'Indian', 'French', 
    'American', 'Mediterranean', 'Thai', 'Chinese', 'Spanish', 
    'Vietnamese', 'Korean', 'Bakery & Cafe', 'Seafood', 'Steakhouse', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
        <h1 className="font-serif-brand text-3xl sm:text-4xl font-extrabold text-slate-900">
          List Your Restaurant on TasteCraft
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Showcase your culinary concept, publish your digital menu with high-resolution food imagery, and connect with passionate food lovers.
        </p>
      </div>

      {/* Auth & Role Guard Banner */}
      {!isAuthenticated ? (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Sign In Required</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Please sign in or create an account with Restaurant Owner status to list your business.
          </p>
          <Link
            to="/login"
            className="inline-block px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            Sign In Now
          </Link>
        </div>
      ) : user?.role !== 'owner' && user?.role !== 'admin' ? (
        <div className="p-6 rounded-3xl bg-brand-50 border border-brand-200 text-brand-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <span>Restaurant Owner Status Required</span>
          </div>
          <p className="text-xs text-brand-800 leading-relaxed">
            You are currently registered as a <strong>Food Reviewer</strong>. Only verified Restaurant Owners can publish new restaurant profiles.
          </p>
          <button
            type="button"
            onClick={handleUpgradeToOwner}
            disabled={upgradingRole}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{upgradingRole ? 'Upgrading Account...' : 'Upgrade My Account to Restaurant Owner (1-Click)'}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold">
            Signed in as <strong>{user?.full_name || user?.username}</strong> (Restaurant Owner). This listing will be automatically linked to your owner account.
          </p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Restaurant Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">1. Basic Information</h2>
              <p className="text-xs text-slate-400">Name, cuisine, and culinary philosophy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Osteria Bella Vista"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description & Story *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the dining concept, chef specialties, ambiance, and culinary philosophy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cuisine Type *
              </label>
              <select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {commonCuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {cuisineType === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specify Cuisine *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peruvian Fusion"
                  value={customCuisine}
                  onChange={(e) => setCustomCuisine(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price Range Tier *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPriceRange(tier)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      priceRange === tier
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {getPriceTier(tier)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">2. Location & Contact</h2>
              <p className="text-xs text-slate-400">Where guests can find and contact you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 124 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Seattle"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State / Region
              </label>
              <input
                type="text"
                placeholder="e.g. WA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Phone Number with Profile Autofill Option */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Restaurant Phone Number
                </label>
                {user?.phone_number && (
                  <button
                    type="button"
                    onClick={handleUseProfilePhone}
                    className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Autofill from Profile ({user.country_code || ''} {user.phone_number})</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="(206) 555-0199"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://www.osteriabv.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Operating Hours
              </label>
              <input
                type="text"
                placeholder="Mon-Sun: 11:30 AM - 10:00 PM"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Photos & Visuals */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">3. High-Resolution Visuals</h2>
              <p className="text-xs text-slate-400">Showcase dining room ambiance and culinary plating</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Highlights & Features */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">4. Highlights & Amenities</h2>
              <p className="text-xs text-slate-400">Select what makes this restaurant special</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableFeatures.map((feat) => {
              const isSelected = selectedFeatures.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-50/80 border-brand-300 text-brand-900 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                  <span>{feat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Initial Digital Menu Items */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">5. Initial Menu Items</h2>
                <p className="text-xs text-slate-400">You and other foodies can also add more dishes later</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMenuItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              <span>Add Dish</span>
            </button>
          </div>

          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Dish #{index + 1}</span>
                  {menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMenuItem(index)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Dish Name (e.g. Truffle Pappardelle)"
                    value={item.name}
                    onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                    className="sm:col-span-2 text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2 text-xs font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="Tasting description and key ingredients..."
                  value={item.description}
                  onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            to="/explore"
            className="px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-105"
          >
            {submitting ? 'Publishing Restaurant...' : 'Publish Restaurant Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
