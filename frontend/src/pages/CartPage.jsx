import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Loader } from '../components';
import { useCartStore, useAuthStore } from '../store';

/**
 * Shopping cart page
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    totalPrice,
    totalItems,
    isLoading,
    fetchCart,
    addItem,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const handleIncreaseQuantity = async (productId) => {
    const result = await addItem(productId, 1);
    if (!result.success) {
      toast.error(result.error || 'Failed to update quantity');
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    const result = await decreaseQuantity(productId);
    if (!result.success) {
      toast.error(result.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    const result = await removeItem(productId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.error || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const result = await clearCart();
      if (result.success) {
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading cart..." />
      </div>
    );
  }

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-[var(--color-bg-surface)] rounded-full flex items-center justify-center">
              <FiShoppingBag size={48} className="text-[var(--color-text-secondary)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
              Your cart is empty
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Button onClick={() => navigate('/products')}>
              Start Shopping
              <FiArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-1">
              Shopping Cart
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={handleClearCart}>
            <FiTrash2 className="mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.productId;
              if (!product || typeof product === 'string') {
                return null; // Skip if product not populated
              }

              return (
                <Card key={product._id} padding="md" className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="w-24 h-24 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-default)]"
                  >
                    <img
                      src={product.productImage || '/placeholder-product.jpg'}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-[var(--color-text-primary)] font-medium hover:text-[var(--color-primary-variant)] transition-colors line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    {product.style && (
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {product.style}
                      </p>
                    )}
                    <p className="text-[var(--color-primary-variant)] font-semibold mt-1">
                      {product.currencyFormat}{product.price?.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-[var(--color-bg-default)] rounded-[var(--radius-sm)]">
                        <button
                          onClick={() => handleDecreaseQuantity(product._id)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-3 text-[var(--color-text-primary)] font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(product._id)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-[var(--radius-sm)] transition-colors"
                        disabled={isLoading}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-[var(--color-text-primary)] font-semibold">
                      {product.currencyFormat}{(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="elevated" padding="lg" className="sticky top-24">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Shipping</span>
                  <span className="text-[var(--color-success)]">Free</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[var(--color-bg-default)] pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-[var(--color-text-primary)]">
                  <span>Total</span>
                  <span className="text-[var(--color-primary-variant)]">
                    ₹{totalPrice?.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button fullWidth size="lg" onClick={handleCheckout}>
                Proceed to Checkout
                <FiArrowRight className="ml-2" />
              </Button>

              <Link
                to="/products"
                className="block text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] mt-4"
              >
                Continue Shopping
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
