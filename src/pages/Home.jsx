import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Pill, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useState, useEffect } from 'react';
import { productApi, categoryApi, mapProduct } from '../lib/api';

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    productApi.getAll().then((data) => setFeatured(data.products.slice(0, 8).map(mapProduct)));
    categoryApi.getAll().then((data) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl" />

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2"
        >
          <div>
            <motion.span variants={heroItem} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5 text-sm text-ink-soft">
              <Sparkles size={14} className="text-gold-600" /> Licensed online pharmacy
            </motion.span>

            <motion.h1 variants={heroItem} className="mt-6 font-display text-4xl leading-[1.08] text-teal-900 sm:text-5xl md:text-6xl">
              Care that reaches you before the fever does.
            </motion.h1>

            <motion.p variants={heroItem} className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Genuine medicines, vitamins and health devices from verified manufacturers — ordered in a minute, delivered in hours.
            </motion.p>

            <motion.div variants={heroItem} className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-teal-900 px-7 py-3.5 font-semibold text-cream transition hover:bg-teal-700"
              >
                Shop products
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about" className="text-sm font-semibold text-teal-900 underline decoration-gold-400 decoration-2 underline-offset-4">
                Why trust us
              </Link>
            </motion.div>

            <motion.div variants={heroItem} className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                ['40k+', 'Orders delivered'],
                ['1,200+', 'Verified SKUs'],
                ['4.7/5', 'Customer rating'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl text-teal-900">{n}</div>
                  <div className="text-xs text-ink-soft">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={heroItem}
            className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-line bg-teal-100"
          >
            <img
              src="https://plus.unsplash.com/premium_photo-1661770294094-06167872e079?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Pharmacist preparing an order"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-paper/95 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-900 text-cream">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-teal-900">Arriving in 3 hours</p>
                  <p className="text-xs text-ink-soft">Live tracking on every order</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-line bg-paper py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-12 gap-y-4 px-6 text-ink-soft md:px-10">
          {[
            [ShieldCheck, 'Verified by licensed pharmacists'],
            [Truck, 'Same-day delivery in metro cities'],
            [Pill, 'Genuine, batch-tested medicines'],
          ].map(([Icon, text], i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm font-medium">
              <Icon size={18} className="text-gold-600" /> {text}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-teal-900 sm:text-4xl">Shop by category</h2>
            <p className="mt-2 text-ink-soft">Everything from your GP's prescription to your daily supplement stack.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-teal-900 underline decoration-gold-400 decoration-2 underline-offset-4">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/products?category=${c.category}`}
                className="flex h-32 flex-col justify-between rounded-2xl border border-line bg-teal-100/60 p-4 transition hover:border-teal-500 hover:bg-teal-100"
              >
                <Pill size={20} className="text-teal-700" />
                <span className="font-display text-base leading-tight text-teal-900">{c.category}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-teal-100/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-teal-950">Trending this week</h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-1">Popular certified medicines and healthcare essentials</p>
            </div>
            <Link to="/products" className="text-xs sm:text-sm font-semibold text-teal-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-teal-700">
              Browse full catalogue →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-3.5">
            {featured.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                index={i} 
                onCardClick={openProductDetail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal Popup */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
