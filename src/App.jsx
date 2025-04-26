import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { initGA, trackPageView } from './utils/ga4Tracking';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import useSessionId from './hooks/useSessionId';

import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccessPage = lazy(() => import('./pages/SuccessPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [render, setRender] = useState(false);
  const sessionId = useSessionId();
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Cart
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                render={render}
                setRender={setRender}
              />
              <Header setIsOpen={setIsOpen} />
              <main className="flex-grow pb-28 md:pb-0">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Home
                          sessionId={sessionId}
                          isCartOpen={isOpen}
                          setIsCartOpen={setIsOpen}
                          render={render}
                          setRender={setRender}
                        />
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
