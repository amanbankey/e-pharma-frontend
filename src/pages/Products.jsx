import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productApi, categoryApi, mapProduct } from '../lib/api';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') || 'all';
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load categories dynamically
  useEffect(() => {
    categoryApi.getAll().then((data) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const call = activeCategory === 'all' ? productApi.getAll() : productApi.getByCategory(activeCategory);
    call
      .then((data) => setProducts(data.products.map(mapProduct)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const setCategory = (id) => {
    if (id === 'all') return setParams({});
    setParams({ category: id });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-4xl text-teal-900">All products</h1>
        <p className="mt-2 max-w-xl text-ink-soft">Browse verified medicines, vitamins and health devices, sorted by category.</p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === 'all' ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft hover:border-teal-500'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setCategory(c.category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategory === c.category ? 'border-teal-900 bg-teal-900 text-cream' : 'border-line text-ink-soft hover:border-teal-500'
              }`}
            >
              {c.category}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500"
          />
        </div>
      </div>

      {loading && <p className="mt-16 text-center text-ink-soft">Loading products…</p>}
      {error && <p className="mt-16 text-center text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="mt-16 text-center text-ink-soft">No products match your search.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}