import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { ProductCard, Loader, Button, Input } from '../components';
import { productsAPI } from '../services/api';

/**
 * Products listing page with filters and search
 */
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    size: searchParams.get('size') || '',
    priceGreaterThan: searchParams.get('priceGreaterThan') || '',
    priceLessThan: searchParams.get('priceLessThan') || '',
    priceSort: searchParams.get('priceSort') || '',
  });

  const sizes = ['XS', 'S', 'M', 'L', 'X', 'XL', 'XXL'];

  const fetchProducts = useCallback(async (filterParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productsAPI.getAll(filterParams);
      if (response.status && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProducts([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch products');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch products on mount and when filters change
  useEffect(() => {
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.size) params.size = filters.size;
    if (filters.priceGreaterThan) params.priceGreaterThan = filters.priceGreaterThan;
    if (filters.priceLessThan) params.priceLessThan = filters.priceLessThan;
    if (filters.priceSort) params.priceSort = filters.priceSort;

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });
    setSearchParams(newSearchParams, { replace: true });

    fetchProducts(params);
  }, [filters, fetchProducts, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      size: '',
      priceGreaterThan: '',
      priceLessThan: '',
      priceSort: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-2">
            All Products
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Discover our collection of premium products
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--color-bg-surface)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.priceSort}
              onChange={(e) => handleFilterChange('priceSort', e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-3 pr-10 bg-[var(--color-bg-surface)] border border-[var(--color-bg-surface)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
            >
              <option value="">Sort by</option>
              <option value="1">Price: Low to High</option>
              <option value="-1">Price: High to Low</option>
            </select>
            <FiChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
              size={20}
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <FiFilter className="mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-[var(--color-primary)] rounded-full text-xs">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`
              fixed md:relative inset-y-0 left-0 z-50 md:z-auto
              w-80 md:w-64 flex-shrink-0
              bg-[var(--color-bg-surface)] md:bg-transparent
              transform ${showFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
              transition-transform duration-300
              overflow-y-auto
            `}
          >
            <div className="p-6 md:p-0">
              {/* Mobile Close Button */}
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full mb-6 py-2 text-sm text-[var(--color-error)] hover:underline"
                >
                  Clear all filters
                </button>
              )}

              {/* Size Filter */}
              <div className="mb-6">
                <h3 className="text-[var(--color-text-primary)] font-medium mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                      className={`
                        px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all
                        ${filters.size === size
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/20'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-[var(--color-text-primary)] font-medium mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--color-text-secondary)] block mb-1">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.priceGreaterThan}
                      onChange={(e) => handleFilterChange('priceGreaterThan', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 bg-[var(--color-bg-default)] border border-[var(--color-bg-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--color-text-secondary)] block mb-1">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.priceLessThan}
                      onChange={(e) => handleFilterChange('priceLessThan', e.target.value)}
                      placeholder="10000"
                      min="0"
                      className="w-full px-4 py-2 bg-[var(--color-bg-default)] border border-[var(--color-bg-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Apply Button */}
              <div className="md:hidden">
                <Button fullWidth onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[var(--color-text-secondary)]">
                {isLoading ? 'Loading...' : `${products.length} products found`}
              </p>

              {/* Desktop Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <FiFilter className="mr-2" size={18} />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            {/* Loading State */}
            {isLoading && <Loader text="Loading products..." />}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <p className="text-[var(--color-error)] mb-4">{error}</p>
                <Button onClick={() => fetchProducts(filters)}>Try Again</Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">
                  No products found
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id || product.title} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
