import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileWarning, Eye, Zap } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import toast from 'react-hot-toast';
import BuyNowModal from './BuyNowModal';

export default function ProductCard({ product, index = 0, onCardClick }) {
  const { addItem } = useCart();
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const outOfStock = product.availableStock !== undefined ? product.availableStock <= 0 : false;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart! 🛒`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    setBuyNowOpen(true);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(product);
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min((index % 6) * 0.05, 0.3) }}
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-line/80 bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-teal-600/40 hover:shadow-lg hover:shadow-teal-950/5 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-teal-50/60 p-2 sm:p-3 flex items-center justify-center">
        <img
          src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-teal-900 px-2 py-0.5 text-[10px] font-bold text-cream shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Rx Badge */}
        {product.prescriptionRequired && (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-500/30">
            <FileWarning size={10} /> Rx
          </span>
        )}

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              Out of stock
            </span>
          </div>
        )}

        {/* Quick View Hover Hint */}
        <div className="absolute inset-0 hidden items-center justify-center bg-teal-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
          <span className="flex items-center gap-1 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold text-teal-950 shadow-md backdrop-blur-sm">
            <Eye size={13} /> View Details
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        {/* Category / Unit */}
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-ink-soft">
          <span className="truncate font-medium text-teal-700/80">{product.category || 'Medicine'}</span>
          {product.unit && <span className="truncate text-ink-soft/70">{product.unit}</span>}
        </div>

        {/* Product Name */}
        <h3 className="mt-1 font-display text-xs sm:text-sm font-semibold leading-tight text-teal-950 line-clamp-2 h-8 sm:h-9 group-hover:text-teal-700 transition-colors">
          {product.name}
        </h3>

        {/* Salt / Composition */}
        {product.composition && (
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-ink-soft/80 truncate">
            {product.composition}
          </p>
        )}

        {/* Price & Quick Add Button */}
        <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-line/50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-sm sm:text-base font-bold text-teal-950">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-xs text-ink-soft/50 line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={outOfStock}
            className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-teal-900 text-cream transition-all duration-200 hover:bg-gold-600 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Buy Now: order this single product directly, without adding it to the cart */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-gold-400 bg-gold-100 py-1.5 text-xs font-semibold text-teal-950 transition-all duration-200 hover:bg-gold-400 hover:text-teal-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:py-2 sm:text-sm"
        >
          <Zap size={13} /> Buy Now
        </button>
      </div>
    </motion.div>

    <BuyNowModal product={product} isOpen={buyNowOpen} onClose={() => setBuyNowOpen(false)} />
    </>
  );
}