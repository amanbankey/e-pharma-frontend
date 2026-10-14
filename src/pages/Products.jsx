import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  PackageSearch,
  ArrowUpDown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { productApi, categoryApi, mapProduct } from '../lib/api';

const ITEMS_PER_PAGE_OPTIONS = [24, 48, 96];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(48);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const topGridRef = useRef(null);

  // Debounce search input for silky-smooth performance with 20,000 items
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories
  useEffect(() => {
    categoryApi
      .getAll()
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    setError('');
    const call = activeCategory === 'all' 
      ? productApi.getAll() 
      : productApi.getByCategory(activeCategory);

    call
      .then((data) => {
        const mapped = (data.products || []).map(mapProduct);
        setProducts(mapped);
        setCurrentPage(1);
      })
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  // Filter and Sort memoized for lightning-fast performance across 20k records
  const filteredProducts = useMemo(() => {
    let result = products;

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.composition && p.composition.toLowerCase().includes(q)) ||
          (p.manufacturer && p.manufacturer.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result = [...result].sort((a, b) => {
        const discA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
        const discB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
        return discB - discA;
      });
    } else if (sortBy === 'name-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, debouncedQuery, sortBy]);

  // Total pages
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Current slice of products to render
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handlePageChange = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    if (topGridRef.current) {
      topGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setJumpPageInput('');
    }
  };

  const handleCategoryChange = (id) => {
    if (id === 'all') {
      setParams({});
    } else {
      setParams({ category: id });
    }
    setCurrentPage(1);
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Generate pagination buttons with smart ellipsis
  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-12 md:px-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-teal-950">
            Pharmacy Catalogue
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-ink-soft max-w-2xl">
            Explore {totalItems > 0 ? `${totalItems.toLocaleString('en-IN')}+` : ''} verified medicines, healthcare products, and wellness essentials.
          </p>
        </div>

        {/* Total counts badge */}
        {!loading && (
          <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3.5 py-1.5 border border-teal-900/10 text-xs text-teal-950 self-start md:self-auto">
            <PackageSearch size={15} className="text-teal-700" />
            <span>
              Showing <strong className="font-bold">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong className="font-bold">{totalItems.toLocaleString('en-IN')}</strong> items
            </span>
          </div>
        )}
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-paper p-3 sm:p-4 border border-line shadow-sm">
        {/* Category Pills - Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-teal-900 text-cream shadow-sm'
                : 'border border-line bg-paper text-ink-soft hover:border-teal-600 hover:text-teal-950'
            }`}
          >
            All Medicines
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => handleCategoryChange(c.category)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCategory === c.category
                  ? 'bg-teal-900 text-cream shadow-sm'
                  : 'border border-line bg-paper text-ink-soft hover:border-teal-600 hover:text-teal-950'
              }`}
            >
              {c.category}
            </button>
          ))}
        </div>

        {/* Search, Sort, and Items Per Page Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-line/60">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine, composition, or brand..."
              className="w-full rounded-xl border border-line bg-teal-50/30 py-2 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-teal-600 focus:bg-paper focus:ring-2 focus:ring-teal-600/10"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5 py-1.5 text-xs">
              <ArrowUpDown size={13} className="text-teal-700 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-teal-950 outline-none cursor-pointer font-medium"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-line bg-paper px-2.5 py-1.5 text-xs">
              <span className="text-ink-soft">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-teal-950 outline-none cursor-pointer font-bold"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Anchor for Scroll */}
      <div ref={topGridRef} className="pt-6" />

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-teal-900 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-ink-soft">Loading medicines catalogue…</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="my-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-xl bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="my-20 flex flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-800">
            <PackageSearch size={32} />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-teal-950">No products found</h3>
          <p className="mt-1 text-xs text-ink-soft max-w-sm">
            We couldn't find any products matching &quot;{debouncedQuery}&quot;. Try adjusting your keywords or browse other categories.
          </p>
          {debouncedQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-xl border border-teal-900 px-4 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-900 hover:text-cream transition"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* High-Capacity Dense Product Grid (30% more compact) */}
      {!loading && !error && paginatedProducts.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-3.5 lg:gap-4">
            {paginatedProducts.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                index={i} 
                onCardClick={openProductDetail}
              />
            ))}
          </div>

          {/* Smart Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4 shadow-sm sm:flex-row">
              {/* Info */}
              <p className="text-xs text-ink-soft text-center sm:text-left">
                Page <strong className="text-teal-950">{currentPage}</strong> of <strong className="text-teal-950">{totalPages}</strong> ({totalItems.toLocaleString('en-IN')} total products)
              </p>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-paper text-teal-950 transition hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-paper"
                  title="First Page"
                >
                  <ChevronsLeft size={15} />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-paper text-teal-950 transition hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-paper"
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page Number Buttons with Ellipsis */}
                {renderPaginationButtons().map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <span key={idx} className="px-1 text-xs text-ink-soft select-none">
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition ${
                        currentPage === p
                          ? 'bg-teal-900 text-cream shadow-sm'
                          : 'border border-line bg-paper text-teal-950 hover:bg-teal-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-paper text-teal-950 transition hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-paper"
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-paper text-teal-950 transition hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-paper"
                  title="Last Page"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>

              {/* Jump to Page Input */}
              <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs">
                <span className="text-ink-soft">Go to:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder={currentPage.toString()}
                  className="h-8 w-14 rounded-lg border border-line bg-teal-50/40 px-2 text-center text-xs font-semibold text-teal-950 outline-none focus:border-teal-600 focus:bg-paper"
                />
                <button
                  type="submit"
                  className="h-8 rounded-lg bg-teal-900/10 px-2.5 font-semibold text-teal-950 hover:bg-teal-900 hover:text-cream transition text-xs"
                >
                  Go
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal Popup */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}