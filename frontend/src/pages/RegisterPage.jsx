import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, User, Phone, ArrowRight, Bell, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { country, countries, setCountry } = useCountry();
  const { showError } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('Male'); // 'Male', 'Female', 'Non-binary', 'Prefer not to say'
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [acceptsPromotions, setAcceptsPromotions] = useState(true);
  const [role, setRole] = useState('user'); // 'user' or 'owner'
  const [loading, setLoading] = useState(false);

  const maxDigits = country.phoneLength?.max || 10;
  const minDigits = country.phoneLength?.min || 10;

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= maxDigits) {
      setPhoneDigits(raw);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate email format on client-side
    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(cleanEmail)) {
      showError('Please enter a valid email address with a valid domain (e.g. user@example.com).');
      return;
    }

    if (phoneDigits && phoneDigits.length < minDigits) {
      showError(`Contact number for ${country.name} must be ${minDigits} digits.`);
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        username: username.trim(),
        gender: gender,
        email: cleanEmail,
        country: country.name,
        country_code: country.callingCode,
        phone_number: phoneDigits.trim(),
        password: password,
        role: role,
        accepts_promotions: acceptsPromotions,
      });
      navigate('/');
    } catch (err) {
      // Error notification handled by AuthContext via Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="font-serif-brand font-extrabold text-2xl text-slate-900">
              TasteCraft
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Join TasteCraft</h2>
          <p className="text-xs text-slate-500">Create an account to start reviewing restaurants & dishes</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3.5 top-2.5 text-xs font-bold pointer-events-none">@</span>
                <input
                  type="text"
                  required
                  placeholder="foodie_alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      gender === g
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Phone Number with Auto Country Contact Initial and Length Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Contact Number (Digits without spaces)</span>
                <span className="text-[10px] text-brand-600 font-normal">
                  {country.name} ({minDigits === maxDigits ? `${maxDigits} digits` : `${minDigits}-${maxDigits} digits`})
                </span>
              </label>
              <div className="flex gap-2">
                <select
                  value={country.code}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setPhoneDigits('');
                  }}
                  className="w-32 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.callingCode}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={maxDigits}
                    placeholder={country.phonePlaceholder || `${maxDigits} digits`}
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Length: {phoneDigits.length}/{maxDigits} digits
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    role === 'user'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Food Reviewer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    role === 'owner'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Restaurant Owner
                </button>
              </div>
            </div>

            {/* Promotions & Updates Opt-in Checkbox (Default: True) */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptsPromotions}
                  onChange={(e) => setAcceptsPromotions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I want to receive promotional discounts, trending dining picks, and community updates via <strong className="text-slate-800">Email and SMS</strong>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
