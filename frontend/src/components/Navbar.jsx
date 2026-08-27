import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bookmark, PlusCircle, User, LogOut, Menu, X, 
  UtensilsCrossed, ChevronDown, Globe, Fingerprint, MapPin 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { country, countryCode, setCountry, countries, detectedLocation } = useCountry();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                TasteCraft
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mt-0.5">
                Food & Reviews
              </span>
            </div>
          </Link>

          {/* Search Bar - Center Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, dishes (e.g. ramen, tacos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border border-slate-200 bg-slate-50/80 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
            />
          </form>

          {/* Navigation Links Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/explore"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Explore Restaurants
            </Link>
            {isAuthenticated && (
              <Link
                to="/profile?tab=bookmarks"
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                Saved
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Country Selector (Auto IP-detected with quick switcher) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-white text-xs font-bold text-slate-700 transition-all shadow-sm"
                title={`Country: ${country.name} (Detected via IP)`}
              >
                <span>{country.flag}</span>
                <span className="hidden sm:inline font-semibold text-slate-800">{country.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">({country.callingCode})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {countryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setCountryDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 max-h-80 overflow-y-auto">
                    <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Country & Region</span>
                      {detectedLocation?.countryName && (
                        <span className="text-[9px] text-emerald-600 font-normal">IP: {detectedLocation.city || detectedLocation.countryName}</span>
                      )}
                    </div>
                    {countries.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCountry(c.code);
                          setCountryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-left transition-colors ${
                          countryCode === c.code
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <p className="font-semibold text-slate-900">{c.name}</p>
                            <p className="text-[10px] text-slate-400">Phone {c.callingCode} • Currency {c.currencySymbol} ({c.currency})</p>
                          </div>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              to="/add-restaurant"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-bold transition-all border border-slate-200"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              <span>Add Restaurant</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-sm"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                    alt={user?.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 divide-y divide-slate-100">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.full_name || user?.username}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        {user?.phone_number && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.phone_number}</p>
                        )}
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-700 font-bold">
                          <Fingerprint className="w-3 h-3 text-brand-500" />
                          ID: {user?.id}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile & Reviews
                        </Link>
                        <Link
                          to="/profile?tab=bookmarks"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          Saved Restaurants
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100"
              >
                Explore Restaurants
              </Link>
              <Link
                to="/add-restaurant"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold text-sm text-brand-600 hover:bg-brand-50 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Restaurant
              </Link>
              {isAuthenticated && (
                <Link
                  to="/profile?tab=bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Restaurants
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
