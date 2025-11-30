import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Loader, Input } from '../components';
import { useCartStore, useAuthStore } from '../store';
import { ordersAPI } from '../services/api';

/**
 * Checkout page for creating orders
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, userId } = useAuthStore();
  const { cartId, items, totalPrice, totalItems, fetchCart, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [cancellable, setCancellable] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Redirect if not authenticated or no cart
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  // Redirect if cart is empty (and not just placed an order)
  useEffect(() => {
    if (!orderPlaced && (!items || items.length === 0)) {
      navigate('/cart');
    }
  }, [items, navigate, orderPlaced]);

  const handlePlaceOrder = async () => {
    if (!cartId) {
      toast.error('Cart not found');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ordersAPI.create(userId, {
        cartId,
        cancellable,
      });

      if (response.status) {
        setOrderData(response.data);
        setOrderPlaced(true);
        await clearCart(); // Clear cart after successful order
        toast.success('Order placed successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Order Success View
  if (orderPlaced && orderData) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[var(--color-success)]/20 rounded-full flex items-center justify-center">
              <FiCheck size={40} className="text-[var(--color-success)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Thank you for your order. Your order ID is: <strong>{orderData._id}</strong>
            </p>

            <Card variant="elevated" padding="lg" className="text-left mb-8">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                Order Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Order ID:</span>
                  <span className="text-[var(--color-text-primary)]">{orderData._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Status:</span>
                  <span className="capitalize text-[var(--color-primary-variant)]">
                    {orderData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total Items:</span>
                  <span className="text-[var(--color-text-primary)]">{orderData.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total Quantity:</span>
                  <span className="text-[var(--color-text-primary)]">{orderData.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Cancellable:</span>
                  <span className="text-[var(--color-text-primary)]">
                    {orderData.cancellable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="border-t border-[var(--color-bg-default)] pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-[var(--color-text-primary)]">Total Amount:</span>
                    <span className="text-[var(--color-primary-variant)]">
                      ₹{orderData.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/orders')}>
                <FiPackage className="mr-2" />
                View Orders
              </Button>
              <Button onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading checkout..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card variant="elevated" padding="lg">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                Shipping Address
              </h2>
              
              {user?.address?.shipping ? (
                <div className="p-4 bg-[var(--color-bg-default)] rounded-[var(--radius-md)]">
                  <p className="text-[var(--color-text-primary)]">
                    {user.fname} {user.lname}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {user.address.shipping.street}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {user.address.shipping.city} - {user.address.shipping.pincode}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    Phone: {user.phone}
                  </p>
                </div>
              ) : (
                <p className="text-[var(--color-text-secondary)]">
                  No shipping address found. Please update your profile.
                </p>
              )}
            </Card>

            {/* Order Options */}
            <Card variant="elevated" padding="lg">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                Order Options
              </h2>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancellable}
                  onChange={(e) => setCancellable(e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--color-bg-surface)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div>
                  <span className="text-[var(--color-text-primary)]">
                    Allow order cancellation
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    You can cancel this order before it&apos;s shipped
                  </p>
                </div>
              </label>
            </Card>

            {/* Order Items Preview */}
            <Card variant="elevated" padding="lg">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                Order Items ({totalItems})
              </h2>
              
              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.productId;
                  if (!product || typeof product === 'string') return null;

                  return (
                    <div key={product._id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-default)]">
                        <img
                          src={product.productImage || '/placeholder-product.jpg'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--color-text-primary)] font-medium truncate">
                          {product.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Qty: {item.quantity} × ₹{product.price?.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-[var(--color-text-primary)] font-medium">
                        ₹{(product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
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
                  <span>Tax (included)</span>
                  <span>₹0.00</span>
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

              <Button
                fullWidth
                size="lg"
                onClick={handlePlaceOrder}
                loading={isLoading}
                disabled={isLoading || !user?.address?.shipping}
              >
                Place Order
              </Button>

              {!user?.address?.shipping && (
                <p className="text-sm text-[var(--color-error)] mt-2 text-center">
                  Please add a shipping address to continue
                </p>
              )}

              <p className="text-xs text-[var(--color-text-secondary)] mt-4 text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
