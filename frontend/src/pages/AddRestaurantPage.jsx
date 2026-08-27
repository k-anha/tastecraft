import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Utensils, MapPin, DollarSign, Image, Clock, 
  Phone, Globe, Plus, Trash2, ArrowLeft, Star, CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCountry } from '../context/CountryContext';

export const AddRestaurantPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showInfo('Please sign in to list a restaurant.');
      navigate('/login');
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
      showSuccess('Restaurant created successfully!');
      navigate(`/restaurants/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create restaurant.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const commonCuisines = [
    'Italian',
    'Japanese',
    'Mexican',
    'Indian',
    'American BBQ',
    'French',
    'Mediterranean',
    'Thai',
    'Chinese',
    'Vegan / Healthy',
    'Cafe & Bakery',
    'Other',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      <div className="space-y-1">
        <h1 className="font-serif-brand text-3xl font-bold text-slate-900">
          List a New Restaurant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Add a restaurant profile, photos, features, and menu items to the TasteCraft directory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              1. Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Trattoria del Porto"
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
                Price Range
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceRange(p)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      priceRange === p
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {getPriceTier(p)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              2. Location & Hours
            </h3>
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
                State
              </label>
              <input
                type="text"
                placeholder="e.g. WA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="(206) 555-0199"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                placeholder="Tue-Sun: 5:00 PM - 10:00 PM"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://myrestaurant.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Photos & Features */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Image className="w-4 h-4 text-brand-500" />
              3. Visuals & Amenities
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Photo URL (Card & Thumbnail)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Banner URL (High Resolution)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Features & Atmosphere Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isChecked
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Initial Menu Builder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-500" />
                4. Menu & Dishes (Optional)
              </h3>
              <p className="text-xs text-slate-500">Add popular dishes so customers can review and comment on them.</p>
            </div>
            <button
              type="button"
              onClick={handleAddMenuItem}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dish
            </button>
          </div>

          <div className="space-y-3">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Dish Name (e.g. Handmade Carbonara)"
                      value={item.name}
                      onChange={(e) => handleMenuItemChange(idx, 'name', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleMenuItemChange(idx, 'category', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Mains">Mains</option>
                      <option value="Appetizers">Appetizers</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Specials">Specials</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price $"
                      value={item.price}
                      onChange={(e) => handleMenuItemChange(idx, 'price', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveMenuItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Short description / ingredients (e.g. Guanciale, egg yolk, pecorino romano)"
                    value={item.description}
                    onChange={(e) => handleMenuItemChange(idx, 'description', e.target.value)}
                    className="flex-1 w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.is_signature}
                      onChange={(e) => handleMenuItemChange(idx, 'is_signature', e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-400"
                    />
                    <span className="font-semibold">Signature Dish</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-extrabold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Building2 className="w-4 h-4" />
            <span>{submitting ? 'Creating Restaurant...' : 'Create Restaurant Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

