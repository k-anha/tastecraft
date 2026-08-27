import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';

const RestaurantCard = lazy(() =>
  import('../components/RestaurantCard').then((m) => ({ default: m.RestaurantCard }))
);
const FilterSidebar = lazy(() =>
  import('../components/FilterSidebar').then((m) => ({ default: m.FilterSidebar }))
);

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'all');
  const [selectedPrice, setSelectedPrice] = useState(
    searchParams.get('price') ? parseInt(searchParams.get('price')) : null
  );
  const [selectedRating, setSelectedRating] = useState(
    searchParams.get('rating') ? parseFloat(searchParams.get('rating')) : 0
  );
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'highest_rated');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with URL params on change
  useEffect(() => {
    const fetchFilterMeta = async () => {
      try {
        const [cuisRes, cityRes] = await Promise.all([
          api.get('/restaurants/cuisines'),
          api.get('/restaurants/cities'),
        ]);
        setCuisines(cuisRes.data);
        setCities(cityRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchFilterMeta();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCuisine && selectedCuisine !== 'all') params.append('cuisine', selectedCuisine);
        if (selectedPrice) params.append('price_range', selectedPrice);
        if (selectedRating > 0) params.append('min_rating', selectedRating);
        if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
        if (sortBy) params.append('sort_by', sortBy);

        const res = await api.get(`/restaurants?${params.toString()}`);
        setRestaurants(res.data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [search, selectedCuisine, selectedPrice, selectedRating, selectedCity, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCuisine('all');
    setSelectedPrice(null);
    setSelectedRating(0);
    setSelectedCity('all');
    setSortBy('highest_rated');
    setSearchParams({});
  };

  const handleBookmarkToggle = (restaurantId, newStatus) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, is_bookmarked: newStatus } : r))
    );
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCuisine !== 'all' ||
    selectedPrice !== null ||
    selectedRating > 0 ||
    selectedCity !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-serif-brand text-3xl font-bold text-slate-900">
            Explore Restaurants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover and compare dining destinations with verified multi-criteria ratings.
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="highest_rated">Highest Rated (Overall)</option>
                <option value="most_reviewed">Most Reviewed</option>
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High ($ to $$$$)</option>
                <option value="price_desc">Price: High to Low ($$$$ to $)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400">Active Filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              "{search}"
              <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedCuisine !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-100 text-xs font-semibold text-brand-900">
              Cuisine: {selectedCuisine}
              <button onClick={() => setSelectedCuisine('all')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedPrice && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">
              Price: {'$'.repeat(selectedPrice)}
              <button onClick={() => setSelectedPrice(null)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedRating > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-xs font-semibold text-amber-900">
              Score: {selectedRating}+
              <button onClick={() => setSelectedRating(0)}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          {selectedCity !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-xs font-semibold text-blue-900">
              City: {selectedCity}
              <button onClick={() => setSelectedCity('all')}><X className="w-3 h-3 hover:text-rose-500" /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-brand-600 hover:text-brand-700 font-bold ml-2 underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <Suspense fallback={<div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />}>
            <FilterSidebar
              cuisines={cuisines}
              cities={cities}
              selectedCuisine={selectedCuisine}
              setSelectedCuisine={setSelectedCuisine}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onReset={handleResetFilters}
            />
          </Suspense>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden col-span-1">
            <Suspense fallback={<div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />}>
              <FilterSidebar
                cuisines={cuisines}
                cities={cities}
                selectedCuisine={selectedCuisine}
                setSelectedCuisine={setSelectedCuisine}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                onReset={handleResetFilters}
              />
            </Suspense>
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">No restaurants match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria or clear the filters to see all available dining spots.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-80 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
                {restaurants.map((restaurant) => (
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
      </div>
    </div>
  );
};

