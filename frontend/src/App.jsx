import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar, Footer } from './components';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  ProfilePage,
  OrdersPage,
} from './pages';
import { useAuthStore, useCartStore } from './store';

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Initialize auth and cart on app load
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchCart();
    }
  }, [isAuthenticated, fetchProfile, fetchCart]);

  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'white',
            },
          },
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />

          {/* Protected Routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">404</div>
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                  Page Not Found
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                  The page you are looking for does not exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </Router>
  );
}

export default App;
