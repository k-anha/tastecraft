import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageMemoryContext = createContext(null);

export const PageMemoryProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Clean up temporary caches of other/previous pages from sessionStorage
    const storageKeys = Object.keys(sessionStorage);
    storageKeys.forEach((key) => {
      if (key.startsWith('page_cache_') && key !== `page_cache_${currentPath}`) {
        sessionStorage.removeItem(key);
      }
    });

    // Store only the current visiting page in session storage
    sessionStorage.setItem('tastecraft_current_visiting_page', JSON.stringify({
      path: currentPath,
      timestamp: new Date().toISOString(),
    }));
  }, [location]);

  const saveCurrentPageState = (stateData) => {
    const currentPath = location.pathname + location.search;
    sessionStorage.setItem(`page_cache_${currentPath}`, JSON.stringify(stateData));
  };

  const getCurrentPageState = () => {
    const currentPath = location.pathname + location.search;
    const data = sessionStorage.getItem(`page_cache_${currentPath}`);
    return data ? JSON.parse(data) : null;
  };

  return (
    <PageMemoryContext.Provider
      value={{
        saveCurrentPageState,
        getCurrentPageState,
        currentPath: location.pathname,
      }}
    >
      {children}
    </PageMemoryContext.Provider>
  );
};

export const usePageMemory = () => {
  const context = useContext(PageMemoryContext);
  if (!context) {
    throw new Error('usePageMemory must be used within a PageMemoryProvider');
  }
  return context;
};

