import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import Badge from './Badge';
import Button from './Button';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

/**
 * Product Card component for displaying product in a grid
 */
const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const { addItem, isLoading } = useCartStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const result = await addItem(product._id);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:translate-y-[-8px] hover:shadow-xl">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-bg-default)]">
          <img
            src={product.productImage || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFreeShipping && (
              <Badge variant="success" size="sm">
                Free Shipping
              </Badge>
            )}
            {product.isDeleted && (
              <Badge variant="error" size="sm">
                Unavailable
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 bg-[var(--color-bg-surface)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast('Added to wishlist!', { icon: '❤️' });
              }}
            >
              <FiHeart size={18} />
            </button>
          </div>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading || product.isDeleted}
              loading={isLoading}
            >
              <FiShoppingCart className="mr-2" size={16} />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-[var(--color-text-primary)] font-medium text-base mb-1 truncate group-hover:text-[var(--color-primary-variant)] transition-colors">
            {product.title}
          </h3>

          {/* Style */}
          {product.style && (
            <p className="text-[var(--color-text-secondary)] text-sm mb-2">
              {product.style}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-[var(--color-primary-variant)] font-semibold text-lg">
              {product.currencyFormat}{product.price?.toFixed(2)}
            </p>
            
            {/* Sizes */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="flex gap-1">
                {product.availableSizes.slice(0, 3).map((size) => (
                  <span
                    key={size}
                    className="px-2 py-0.5 text-xs bg-[var(--color-bg-default)] text-[var(--color-text-secondary)] rounded"
                  >
                    {size}
                  </span>
                ))}
                {product.availableSizes.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                    +{product.availableSizes.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Installments */}
          {product.installments && product.installments > 0 && (
            <p className="text-[var(--color-text-secondary)] text-xs mt-2">
              or {product.installments}x of {product.currencyFormat}{(product.price / product.installments).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    currencyFormat: PropTypes.string,
    productImage: PropTypes.string,
    style: PropTypes.string,
    availableSizes: PropTypes.arrayOf(PropTypes.string),
    isFreeShipping: PropTypes.bool,
    installments: PropTypes.number,
    isDeleted: PropTypes.bool,
  }).isRequired,
};

export default ProductCard;
