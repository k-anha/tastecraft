import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, Phone, ArrowRight, UserCheck, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCountry } from '../context/CountryContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { country, countries, setCountry } = useCountry();

  // Login Mode: 'email_or_username' | 'mobile'
  const [loginMode, setLoginMode] = useState('email_or_username');

  // Mode 1 State
  const [emailOrUsername, setEmailOrUsername] = useState('');

  // Mode 2 State (Mobile Login)
  const [selectedCountryCode, setSelectedCountryCode] = useState(country.code || 'IN');
  const [mobileNumber, setMobileNumber] = useState('');

  // Password & Loading
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Get active country object for mobile mode length restrictions
  const activeMobileCountry = countries.find((c) => c.code === selectedCountryCode) || country;
  const maxDigits = activeMobileCountry.phoneLength?.max || 10;
  const minDigits = activeMobileCountry.phoneLength?.min || 10;

  const handleMobileNumberChange = (e) => {
    // Strip non-digits and enforce country maxLength
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= maxDigits) {
      setMobileNumber(raw);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (loginMode === 'mobile') {
        if (mobileNumber.length < minDigits) {
          throw new Error(`Mobile number for ${activeMobileCountry.name} must be ${minDigits} digits.`);
        }
        await login({
          country_code: activeMobileCountry.callingCode,
          phone_number: mobileNumber.trim(),
          password: password,
        });
      } else {
        await login({
          email_or_username: emailOrUsername.trim(),
          password: password,
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (credentials) => {
    setLoading(true);
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      // Handled
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
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Choose your preferred login mode to access TasteCraft</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setLoginMode('email_or_username')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'email_or_username'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email / Username</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMode('mobile')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              <span>Login using mobile</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mode 1: Email or Username */}
            {loginMode === 'email_or_username' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="foodie_alex or alex@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            ) : (
              /* Mode 2: Login using Mobile Number */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Mobile Number</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {activeMobileCountry.name} ({minDigits === maxDigits ? `${maxDigits} digits` : `${minDigits}-${maxDigits} digits`})
                    </span>
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => {
                        setSelectedCountryCode(e.target.value);
                        setMobileNumber(''); // reset digits on country change to prevent invalid length
                      }}
                      className="w-32 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.callingCode}
                        </option>
                      ))}
                    </select>

                    {/* Numeric Digits Input */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={maxDigits}
                        placeholder={activeMobileCountry.phonePlaceholder || `${maxDigits} digits`}
                        value={mobileNumber}
                        onChange={handleMobileNumberChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    No spaces or country code needed in input. Current length: {mobileNumber.length}/{maxDigits}
                  </p>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? 'Signing In...' : loginMode === 'mobile' ? 'Sign In via Mobile' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    country_code: '+1',
                    phone_number: '2065550143',
                    password: 'password123',
                  })
                }
                className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition-all"
              >
                <span className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-500" /> Alex (Mobile)
                </span>
                <span className="text-[10px] text-slate-500 block truncate">🇺🇸 +1 2065550143</span>
                <span className="text-[9px] font-mono text-brand-600 block mt-0.5">ID: a18b9c2d1e4f</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    email_or_username: 'chef_mario',
                    password: 'password123',
                  })
                }
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all"
              >
                <span className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Chef Mario (Username)
                </span>
                <span className="text-[10px] text-slate-500 block truncate">chef_mario</span>
                <span className="text-[9px] font-mono text-amber-700 block mt-0.5">ID: b29c0d3e2f5a</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
