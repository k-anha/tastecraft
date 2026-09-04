import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { PageMemoryProvider } from './context/PageMemoryContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoadingFallback } from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load route pages on-demand
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage }))
);
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((module) => ({ default: module.ExplorePage }))
);
const RestaurantDetailPage = lazy(() =>
  import('./pages/RestaurantDetailPage').then((module) => ({ default: module.RestaurantDetailPage }))
);
const WriteReviewPage = lazy(() =>
  import('./pages/WriteReviewPage').then((module) => ({ default: module.WriteReviewPage }))
);
const AddRestaurantPage = lazy(() =>
  import('./pages/AddRestaurantPage').then((module) => ({ default: module.AddRestaurantPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
            <Router>
              <PageMemoryProvider>
                <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-1 flex flex-col">
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/explore" element={<ExplorePage />} />
                          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                          <Route path="/write-review" element={<WriteReviewPage />} />
                          <Route path="/write-review/:restaurantId" element={<WriteReviewPage />} />
                          <Route path="/add-restaurant" element={<AddRestaurantPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          {/* 404 & Invalid Route Catch-all */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                </div>
              </PageMemoryProvider>
            </Router>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
