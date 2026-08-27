import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Star, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif-brand font-bold text-xl text-white">
                TasteCraft
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering food lovers to discover exquisite dining experiences with deep multi-criteria reviews, dish-specific tasting notes, and honest foodie critique.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/explore" className="hover:text-brand-400 transition-colors">
                  All Restaurants
                </Link>
              </li>
              <li>
                <Link to="/explore?sort=highest_rated" className="hover:text-brand-400 transition-colors">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/add-restaurant" className="hover:text-brand-400 transition-colors">
                  Add a Restaurant
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Popular Cuisines
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/explore?cuisine=Italian" className="hover:text-brand-400 transition-colors">
                  Italian Trattorias
                </Link>
              </li>
              <li>
                <Link to="/explore?cuisine=Japanese" className="hover:text-brand-400 transition-colors">
                  Japanese & Ramen
                </Link>
              </li>
              <li>
                <Link to="/explore?cuisine=Mexican" className="hover:text-brand-400 transition-colors">
                  Mexican & Birria
                </Link>
              </li>
              <li>
                <Link to="/explore?cuisine=Indian" className="hover:text-brand-400 transition-colors">
                  Indian & Tandoori
                </Link>
              </li>
            </ul>
          </div>

          {/* Review Criteria Highlight */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Why Multi-Criteria?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We separate <strong className="text-slate-200">Food</strong>, <strong className="text-slate-200">Price / Value</strong>, <strong className="text-slate-200">Service</strong>, and <strong className="text-slate-200">Ambiance</strong> so you always know what to expect before ordering.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TasteCraft Inc. Crafted for epicureans worldwide.</p>
          <div className="flex items-center gap-1">
            <span>FastAPI</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

