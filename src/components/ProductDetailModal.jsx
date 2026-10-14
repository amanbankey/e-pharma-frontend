import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Zap,
  FileWarning, 
  ShieldCheck, 
  Truck, 
  Calendar, 
  Package, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { useCart } from '../lib/CartContext';
import toast from 'react-hot-toast';
import BuyNowModal from './BuyNowModal';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'];

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const savings = product.mrp > product.price ? product.mrp - product.price : 0;
  const isOutOfStock = product.availableStock !== undefined ? product.availableStock <= 0 : false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} of ${product.name} to cart! 🛒`);
  };

  const handleIncrement = () => {
    if (product.availableStock && quantity >= product.availableStock) {
      toast.error(`Only ${product.availableStock} units available in stock!`);
      return;
    }
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  return (
    <>
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-paper shadow-2xl"
        >
          {/* Header Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-teal-950 shadow-md backdrop-blur-md transition-all hover:bg-teal-900 hover:text-cream sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              
              {/* Left Column: Image and Thumbnails */}
              <div className="flex flex-col gap-3 md:col-span-5">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-teal-50/50 flex items-center justify-center">
                  <img
                    src={images[selectedImageIndex] || images[0]}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />

                  {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-teal-900 px-2.5 py-1 text-xs font-semibold text-cream shadow-sm">
                      {discount}% OFF
                    </span>
                  )}

                  {product.prescriptionRequired && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-500/20">
                      <FileWarning size={13} /> Rx Required
                    </span>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail list if multiple images exist */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          selectedImageIndex === idx ? 'border-teal-900 ring-2 ring-teal-900/20' : 'border-line opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-teal-50/60 p-3 text-xs text-teal-950">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-teal-700 flex-shrink-0" />
                    <span className="font-medium">100% Genuine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={16} className="text-teal-700 flex-shrink-0" />
                    <span className="font-medium">Express Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Full Product Info & Actions */}
              <div className="flex flex-col md:col-span-7">
                {/* Category & Manufacturer */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-3 py-0.5 text-xs font-semibold text-teal-800">
                    {product.category || 'Medicine'}
                  </span>
                  {product.manufacturer && (
                    <span className="text-xs text-ink-soft">
                      by <strong className="text-teal-950">{product.manufacturer}</strong>
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h2 className="mt-2.5 font-display text-2xl sm:text-3xl leading-snug text-teal-950">
                  {product.name}
                </h2>

                {/* Composition & Unit Specs */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-ink-soft">
                  {product.composition && (
                    <div className="flex items-center gap-1 rounded-md bg-cream/70 px-2 py-1 border border-line">
                      <Activity size={14} className="text-teal-700" />
                      <span>Salt: <strong className="text-teal-900">{product.composition}</strong></span>
                    </div>
                  )}

                  {product.unit && (
                    <div className="flex items-center gap-1 rounded-md bg-cream/70 px-2 py-1 border border-line">
                      <Package size={14} className="text-teal-700" />
                      <span>Packaging: <strong className="text-teal-900">{product.unit}</strong></span>
                    </div>
                  )}

                  {product.expiryDate && (
                    <div className="flex items-center gap-1 rounded-md bg-cream/70 px-2 py-1 border border-line">
                      <Calendar size={14} className="text-teal-700" />
                      <span>Expires: <strong className="text-teal-900">{new Date(product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong></span>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="mt-5 flex flex-wrap items-baseline gap-3 rounded-2xl bg-teal-50/40 p-3.5 border border-teal-900/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-teal-950">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-base text-ink-soft/60 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="rounded-full bg-teal-900/10 px-2.5 py-0.5 text-xs font-semibold text-teal-900">
                      Save ₹{savings} ({discount}%)
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-ink-soft">Inclusive of all taxes</span>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900/80">Product Overview</h4>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-ink-soft">
                    {product.description ||
                      `${product.name} is a certified pharmaceutical product formulated with ${product.composition || 'standard active ingredients'}. Recommended for use as advised by a qualified healthcare professional.`}
                  </p>
                </div>

                {/* Stock Status Indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {isOutOfStock ? (
                    <span className="flex items-center gap-1 font-semibold text-red-600">
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" /> Out of stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 size={14} className="text-emerald-600" /> In Stock & Ready to Ship
                    </span>
                  )}
                </div>

                {/* Action Section: Quantity + Add to Cart */}
                <div className="mt-6 flex flex-wrap items-center gap-3 pt-3 border-t border-line">
                  {/* Quantity selector */}
                  {!isOutOfStock && (
                    <div className="flex items-center rounded-xl border border-line bg-paper shadow-sm">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="grid h-10 w-10 place-items-center text-teal-950 transition hover:bg-teal-50 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-teal-950">{quantity}</span>
                      <button
                        onClick={handleIncrement}
                        className="grid h-10 w-10 place-items-center text-teal-950 transition hover:bg-teal-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-900 py-3 px-6 text-sm font-semibold text-cream shadow-md transition hover:bg-gold-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingCart size={17} />
                    <span>{isOutOfStock ? 'Currently Unavailable' : `Add ${quantity > 1 ? `(${quantity}) ` : ''}to Cart • ₹${product.price * quantity}`}</span>
                  </button>

                  {/* Buy Now Button: order this product directly with the chosen quantity */}
                  {!isOutOfStock && (
                    <button
                      onClick={() => setBuyNowOpen(true)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold-400 bg-gold-100 py-3 px-6 text-sm font-semibold text-teal-950 shadow-sm transition hover:bg-gold-400"
                    >
                      <Zap size={17} />
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>

    <BuyNowModal
      product={product}
      isOpen={buyNowOpen}
      onClose={() => setBuyNowOpen(false)}
      initialQty={quantity}
    />
    </>
  );
}
