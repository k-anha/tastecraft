import React, { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext(null);

export const COUNTRIES = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    callingCode: '+91',
    currency: 'INR',
    currencySymbol: '₹',
    rate: 83.5,
    decimals: 0,
    phoneLength: { min: 10, max: 10 },
    phonePlaceholder: '9876543210 (10 digits)',
    states: ['Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Kerala', 'Punjab', 'Goa'],
    defaultCity: 'Mumbai',
  },
  US: {
    code: 'US',
    name: 'America',
    flag: '🇺🇸',
    callingCode: '+1',
    currency: 'USD',
    currencySymbol: '$',
    rate: 1.0,
    decimals: 2,
    phoneLength: { min: 10, max: 10 },
    phonePlaceholder: '2065550143 (10 digits)',
    states: ['Washington', 'California', 'New York', 'Texas', 'Illinois', 'Florida', 'Massachusetts', 'Colorado', 'Oregon'],
    defaultCity: 'Seattle',
  },
  CN: {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    callingCode: '+86',
    currency: 'CNY',
    currencySymbol: '¥',
    rate: 7.25,
    decimals: 2,
    phoneLength: { min: 11, max: 11 },
    phonePlaceholder: '13800138000 (11 digits)',
    states: ['Beijing', 'Shanghai', 'Guangdong', 'Sichuan', 'Zhejiang', 'Jiangsu'],
    defaultCity: 'Shanghai',
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    callingCode: '+81',
    currency: 'JPY',
    currencySymbol: '¥',
    rate: 155.0,
    decimals: 0,
    phoneLength: { min: 10, max: 11 },
    phonePlaceholder: '9012345678 (10-11 digits)',
    states: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fukuoka'],
    defaultCity: 'Tokyo',
  },
};

// Fallback timezone country mapping
const inferCountryFromTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) return 'IN';
    if (tz.includes('Tokyo') || tz.includes('Asia/Tokyo') || tz.includes('Japan')) return 'JP';
    if (tz.includes('Shanghai') || tz.includes('Beijing') || tz.includes('Chongqing') || tz.includes('China')) return 'CN';
    if (tz.includes('America') || tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return 'US';
  } catch (e) {
    // fallback
  }
  return 'IN';
};

export const CountryProvider = ({ children }) => {
  const [countryCode, setCountryCode] = useState(() => {
    const saved = localStorage.getItem('tastecraft_country');
    return saved && COUNTRIES[saved] ? saved : inferCountryFromTimezone();
  });

  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // IP Geolocation Detection on Mount
  useEffect(() => {
    let isMounted = true;

    const detectIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code && isMounted) {
            const code = data.country_code.toUpperCase();
            if (COUNTRIES[code]) {
              const savedChoice = localStorage.getItem('tastecraft_country_manual');
              if (!savedChoice) {
                setCountryCode(code);
                localStorage.setItem('tastecraft_country', code);
              }
            }
            setDetectedLocation({
              ip: data.ip,
              countryCode: data.country_code,
              countryName: data.country_name,
              region: data.region,
              city: data.city,
              callingCode: data.country_calling_code || '',
            });
            setIsDetecting(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to secondary service or timezone
      }

      try {
        const res = await fetch('https://ipwhois.app/json/', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code && isMounted) {
            const code = data.country_code.toUpperCase();
            if (COUNTRIES[code]) {
              const savedChoice = localStorage.getItem('tastecraft_country_manual');
              if (!savedChoice) {
                setCountryCode(code);
                localStorage.setItem('tastecraft_country', code);
              }
            }
            setDetectedLocation({
              ip: data.ip,
              countryCode: data.country_code,
              countryName: data.country,
              region: data.region,
              city: data.city,
              callingCode: data.country_phone || '',
            });
          }
        }
      } catch (e) {
        // Handled
      } finally {
        if (isMounted) setIsDetecting(false);
      }
    };

    detectIpLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetCountry = (code) => {
    if (COUNTRIES[code]) {
      setCountryCode(code);
      localStorage.setItem('tastecraft_country', code);
      localStorage.setItem('tastecraft_country_manual', 'true');
    }
  };

  const activeCountry = COUNTRIES[countryCode] || COUNTRIES.IN;

  const formatPrice = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined || isNaN(amountInUSD)) {
      return '-';
    }
    const num = parseFloat(amountInUSD);
    const converted = num * activeCountry.rate;

    if (activeCountry.decimals === 0) {
      return `${activeCountry.currencySymbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${activeCountry.currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Convert an amount entered in the user's active currency back to base USD for database storage
  const toUSD = (amountInCurrentCurrency) => {
    if (amountInCurrentCurrency === null || amountInCurrentCurrency === undefined || amountInCurrentCurrency === '' || isNaN(amountInCurrentCurrency)) {
      return 0;
    }
    const num = parseFloat(amountInCurrentCurrency);
    if (isNaN(num) || num <= 0) return 0;
    const rate = activeCountry.rate || 1.0;
    return num / rate;
  };

  // Convert an amount stored in base USD to the user's active currency (numeric)
  const fromUSD = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined || amountInUSD === '' || isNaN(amountInUSD)) {
      return 0;
    }
    const num = parseFloat(amountInUSD);
    if (isNaN(num)) return 0;
    const rate = activeCountry.rate || 1.0;
    return num * rate;
  };

  // Get raw price string in current currency without symbol (ideal for prefilling input fields)
  const getRawPriceInCurrency = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined || amountInUSD === '' || isNaN(amountInUSD)) {
      return '';
    }
    const num = parseFloat(amountInUSD);
    if (isNaN(num)) return '';
    const rate = activeCountry.rate || 1.0;
    const converted = num * rate;
    if (activeCountry.decimals === 0) {
      return Math.round(converted).toString();
    }
    return parseFloat(converted.toFixed(activeCountry.decimals)).toString();
  };

  const getPriceTier = (priceRangeNumber = 2) => {
    const symbol = activeCountry.currencySymbol.trim();
    return symbol.repeat(Math.max(1, Math.min(4, priceRangeNumber || 2)));
  };

  return (
    <CountryContext.Provider
      value={{
        country: activeCountry,
        countryCode,
        setCountry: handleSetCountry,
        countries: Object.values(COUNTRIES),
        callingCode: activeCountry.callingCode,
        currency: activeCountry.currency,
        currencySymbol: activeCountry.currencySymbol,
        states: activeCountry.states,
        phoneLength: activeCountry.phoneLength,
        phonePlaceholder: activeCountry.phonePlaceholder,
        formatPrice,
        toUSD,
        fromUSD,
        getRawPriceInCurrency,
        getPriceTier,
        detectedLocation,
        isDetecting,
        activeCurrency: {
          code: activeCountry.currency,
          symbol: activeCountry.currencySymbol,
          flag: activeCountry.flag,
          rate: activeCountry.rate,
          decimals: activeCountry.decimals,
          name: `${activeCountry.name} (${activeCountry.currency})`,
        },
        currencies: Object.values(COUNTRIES).map((c) => ({
          code: c.currency,
          symbol: c.currencySymbol,
          flag: c.flag,
          rate: c.rate,
          decimals: c.decimals,
          name: `${c.name} (${c.currency})`,
        })),
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

export const useCurrency = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CountryProvider');
  }
  return context;
};
