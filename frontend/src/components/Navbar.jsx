import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bookmark, PlusCircle, User, LogOut, Menu, X,
  UtensilsCrossed, ChevronDown, Globe, MapPin, Sun, Moon,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { country, countryCode, setCountry, countries } = useCountry();
  const { theme, isDark, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                TasteCraft
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mt-0.5">
                Food & Reviews
              </span>
            </div>
          </Link>

          {/* Search Bar - Center Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, dishes (e.g. ramen, tacos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
            />
          </form>

          {/* Navigation Links Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/explore"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Explore Restaurants
            </Link>
            {isAuthenticated && (
              <Link
                to="/profile?tab=bookmarks"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Saved
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GitHub Repository / Developer Link */}
            <a
              href="https://github.com/k-anha/tastecraft"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository & Developer Profile (@k-anha)"
              title="GitHub: @k-anha (TasteCraft Repo)"
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <FaGithub className="w-4 h-4" />
            </a>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 transition-transform rotate-0 scale-100" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900 transition-transform -rotate-12 scale-100" />
              )}
            </button>

            {/* Country Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                title={`Country: ${country.name}`}
              >
                <span>{country.flag}</span>
                <span className="hidden sm:inline font-semibold text-slate-800 dark:text-slate-200">{country.name}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">({country.callingCode})</span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </button>

              {countryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setCountryDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-30 max-h-80 overflow-y-auto">
                    <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <span>Country & Region</span>
                    </div>
                    {countries.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCountry(c.code);
                          setCountryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-left transition-colors ${countryCode === c.code
                            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-150">{c.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Phone {c.callingCode} • Currency {c.currencySymbol} ({c.currency})</p>
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all border border-slate-200 dark:border-slate-700"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              <span>Add Restaurant</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 transition-all shadow-sm"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                    alt={user?.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-30 divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user?.full_name || user?.username}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        {user?.phone_number && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.country_code || ''} {user?.phone_number}</p>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile & Reviews
                        </Link>
                        <Link
                          to="/profile?tab=bookmarks"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
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
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Explore Restaurants
              </Link>
              <Link
                to="/add-restaurant"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl font-semibold text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Restaurant
              </Link>
              {isAuthenticated && (
                <Link
                  to="/profile?tab=bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Restaurants
                </Link>
              )}
              {/* Theme Toggle Mobile */}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                }}
                className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {isDark ? 'Tap to Switch' : 'Tap to Switch'}
                </span>
              </button>

              {/* GitHub Link Mobile */}
              <a
                href="https://github.com/k-anha/tastecraft"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  <span>GitHub (@k-anha)</span>
                </span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                  View Repo ↗
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
