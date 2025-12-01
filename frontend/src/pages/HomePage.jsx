import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { Button, ProductCard, Loader } from '../components';
import { productsAPI } from '../services/api';

/**
 * Home page with hero section and featured products
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getAll({ priceSort: -1 });
        if (response.status && response.data) {
          // Get top 8 products
          setFeaturedProducts(response.data.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      icon: FiTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹999',
    },
    {
      icon: FiShield,
      title: 'Secure Payment',
      description: '100% secure payment methods',
    },
    {
      icon: FiRefreshCw,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: FiHeadphones,
      title: '24/7 Support',
      description: 'Dedicated customer support',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center bg-gradient-to-br from-[var(--color-bg-default)] via-[var(--color-bg-surface)] to-[var(--color-bg-default)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-primary-variant)]/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary-variant)] rounded-full text-sm font-medium mb-6">
              New Collection 2024
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--color-text-primary)] leading-tight mb-6">
              Discover Your
              <span className="text-[var(--color-primary-variant)]"> Perfect Style</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 max-w-xl">
              Explore our curated collection of premium fashion products. 
              Quality meets style in every piece.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/products')}
              >
                Shop Now
                <FiArrowRight className="ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/products?priceSort=-1')}
              >
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[var(--color-bg-surface)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-6 bg-[var(--color-bg-default)] rounded-[var(--radius-lg)]"
              >
                <div className="p-3 bg-[var(--color-primary)]/20 rounded-full">
                  <feature.icon size={24} className="text-[var(--color-primary-variant)]" />
                </div>
                <div>
                  <h3 className="text-[var(--color-text-primary)] font-medium">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
                Featured Products
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Check out our most popular items
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center text-[var(--color-primary-variant)] hover:underline"
            >
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <Loader text="Loading products..." />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.title} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-secondary)] mb-4">
                No products available at the moment.
              </p>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Browse All Products
              </Button>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center text-[var(--color-primary-variant)]"
            >
              View All Products
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-variant)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Subscribe to get special offers, free giveaways, and exclusive deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white"
            />
            <Button
              variant="secondary"
              className="bg-white text-[var(--color-primary)] hover:bg-white/90"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
