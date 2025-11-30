import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPackage, FiClock, FiCheck, FiX, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Loader, Badge, Modal } from '../components';
import { useAuthStore } from '../store';
import { ordersAPI } from '../services/api';

/**
 * Orders page - displays user orders
 * Note: The backend doesn't have a GET orders endpoint, so this is a placeholder
 * that would show orders if the endpoint existed
 */
const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
      return;
    }
    // Simulate loading - in a real app, we would fetch orders here
    // Since the backend doesn't have a GET orders endpoint, we'll show empty state
    setIsLoading(false);
  }, [isAuthenticated, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-[var(--color-warning)]" />;
      case 'completed':
        return <FiCheck className="text-[var(--color-success)]" />;
      case 'canceled':
        return <FiX className="text-[var(--color-error)]" />;
      default:
        return <FiPackage className="text-[var(--color-text-secondary)]" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    setCancelling(true);

    try {
      const response = await ordersAPI.updateStatus(userId, {
        orderId: selectedOrder._id,
        status: 'canceled',
      });

      if (response.status) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, status: 'canceled' }
              : order
          )
        );
        toast.success('Order cancelled successfully');
        setCancelModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading orders..." />
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
            My Orders
          </h1>

          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-[var(--color-bg-surface)] rounded-full flex items-center justify-center">
              <FiShoppingBag size={48} className="text-[var(--color-text-secondary)]" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
              No orders yet
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>

          {/* Info Note */}
          <Card variant="outlined" padding="md" className="max-w-2xl mx-auto mt-8">
            <div className="flex items-start gap-3">
              <FiPackage className="text-[var(--color-primary-variant)] mt-1" size={20} />
              <div>
                <h3 className="text-[var(--color-text-primary)] font-medium mb-1">
                  Order History
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Once you place an order, it will appear here. You can track your order status
                  and cancel orders that are still pending (if cancellation is allowed).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-8">
          My Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} variant="elevated" padding="lg">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--color-bg-default)]">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </Badge>
                  {order.status === 'pending' && order.cancellable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setCancelModalOpen(true);
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--color-bg-default)]" />
                    <div className="flex-1">
                      <p className="text-[var(--color-text-primary)]">
                        Product ID: {item.productId}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-[var(--color-bg-default)]">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[var(--color-text-secondary)]">Items: </span>
                    <span className="text-[var(--color-text-primary)]">{order.totalItems}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)]">Quantity: </span>
                    <span className="text-[var(--color-text-primary)]">{order.totalQuantity}</span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-[var(--color-primary-variant)]">
                  Total: ₹{order.totalPrice?.toFixed(2)}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedOrder(null);
          }}
          title="Cancel Order"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)]">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button
                variant="danger"
                onClick={handleCancelOrder}
                loading={cancelling}
                disabled={cancelling}
              >
                Yes, Cancel Order
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Keep Order
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage;
