import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiCheck, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Badge, Loader } from '../components';
import { productsAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../store';

/**
 * Product detail page
 */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuthStore();
  const { addItem, isLoading: cartLoading } = useCartStore();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productsAPI.getById(productId);
        if (response.status && response.data) {
          setProduct(response.data);
          // Set default selected size
          if (response.data.availableSizes?.length > 0) {
            setSelectedSize(response.data.availableSizes[0]);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const result = await addItem(productId, quantity);
    if (result.success) {
      toast.success(`${quantity} item(s) added to cart!`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
          Product Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {error || 'The product you are looking for does not exist.'}
        </p>
        <Button onClick={() => navigate('/products')}>
          <FiChevronLeft className="mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const features = [
    { icon: FiTruck, text: product.isFreeShipping ? 'Free Shipping' : 'Standard Shipping' },
    { icon: FiShield, text: 'Quality Guaranteed' },
    { icon: FiRefreshCw, text: '30-Day Returns' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[var(--color-text-secondary)] mb-8">
          <Link to="/" className="hover:text-[var(--color-primary-variant)]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[var(--color-primary-variant)]">Products</Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-surface)]">
              <img
                src={product.productImage || '/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFreeShipping && (
                <Badge variant="success">Free Shipping</Badge>
              )}
              {product.isDeleted && (
                <Badge variant="error">Unavailable</Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toast('Added to wishlist!', { icon: '❤️' })}
                className="p-3 bg-[var(--color-bg-surface)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
              >
                <FiHeart size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-[var(--color-bg-surface)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-primary-variant)] transition-colors"
              >
                <FiShare2 size={20} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
                {product.title}
              </h1>
              {product.style && (
                <p className="text-[var(--color-text-secondary)] mb-4">{product.style}</p>
              )}
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-semibold text-[var(--color-primary-variant)]">
                  {product.currencyFormat}{product.price?.toFixed(2)}
                </p>
                {product.installments && product.installments > 0 && (
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    or {product.installments}x of {product.currencyFormat}
                    {(product.price / product.installments).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                Description
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                    Select Size
                  </h3>
                  <button className="text-sm text-[var(--color-primary-variant)] hover:underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        relative px-6 py-3 rounded-[var(--radius-md)] font-medium transition-all
                        ${selectedSize === size
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] border border-transparent'
                        }
                      `}
                    >
                      {size}
                      {selectedSize === size && (
                        <FiCheck className="absolute top-1 right-1" size={12} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[var(--color-bg-surface)] rounded-[var(--radius-md)]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-[var(--color-text-primary)] font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    +
                  </button>
                </div>
                <span className="text-[var(--color-text-secondary)]">
                  Total: {product.currencyFormat}{(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={cartLoading || product.isDeleted}
                loading={cartLoading}
              >
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-[var(--color-bg-surface)]">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <feature.icon className="text-[var(--color-primary-variant)] mb-2" size={24} />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Currency Info */}
            <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Currency: {product.currencyId} ({product.currencyFormat})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
