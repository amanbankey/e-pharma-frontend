// import { motion } from 'framer-motion';
// import { Plus, Star, FileWarning } from 'lucide-react';
// import { useCart } from '../lib/CartContext';
// import toast from 'react-hot-toast';
// export default function ProductCard({ product, index = 0 }) {
//   const { addItem } = useCart();
//   const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: '-40px' }}
//       transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
//       className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-shadow hover:shadow-xl hover:shadow-teal-900/5"
//     >
//       <div className="relative aspect-square overflow-hidden bg-teal-100">
//         <img
//           src={product.image}
//           alt={product.name}
//           className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
//         />
//         {discount > 0 && (
//           <span className="absolute left-3 top-3 rounded-full bg-teal-900 px-2.5 py-1 text-xs font-semibold text-cream">
//             {discount}% off
//           </span>
//         )}
//         {product.prescriptionRequired && (
//           <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-medium text-gold-600">
//             <FileWarning size={12} /> Rx
//           </span>
//         )}
//       </div>

//       <div className="flex flex-1 flex-col gap-2 p-5">
//         <div className="flex items-center gap-1 text-xs font-medium text-gold-600">
//           <Star size={13} fill="currentColor" strokeWidth={0} />
//           {product.rating}
//         </div>
//         <h3 className="font-display text-lg leading-snug text-teal-900">{product.name}</h3>
//         <p className="text-sm text-ink-soft">{product.composition}</p>
//         <p className="text-xs uppercase tracking-wide text-ink-soft/70">{product.unit}</p>

//         <div className="mt-auto flex items-center justify-between pt-3">
//           <div className="flex items-baseline gap-2">
//             <span className="font-display text-lg text-teal-900">₹{product.price}</span>
//             <span className="text-sm text-ink-soft/60 line-through">₹{product.mrp}</span>
//           </div>
//           <button
//             onClick={() => {addItem(product)
//                 toast.success("Added")
//             }}
//             className="grid h-9 w-9 place-items-center rounded-full bg-teal-900 text-cream transition hover:bg-gold-600"
//             aria-label={`Add ${product.name} to cart`}
//           >
//             <Plus size={18} />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }




import { motion } from 'framer-motion';
import { Plus, FileWarning } from 'lucide-react';
import { useCart } from '../lib/CartContext';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = product.availableStock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-shadow hover:shadow-xl hover:shadow-teal-900/5"
    >
      <div className="relative aspect-square overflow-hidden bg-teal-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-teal-900 px-2.5 py-1 text-xs font-semibold text-cream">
            {discount}% off
          </span>
        )}
        {product.prescriptionRequired && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-medium text-gold-600">
            <FileWarning size={12} /> Rx
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-teal-900/90 py-1.5 text-center text-xs font-semibold text-cream">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg leading-snug text-teal-900">{product.name}</h3>
        <p className="text-sm text-ink-soft">{product.composition}</p>
        <p className="text-xs uppercase tracking-wide text-ink-soft/70">{product.unit}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-teal-900">₹{product.price}</span>
            <span className="text-sm text-ink-soft/60 line-through">₹{product.mrp}</span>
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="grid h-9 w-9 place-items-center rounded-full bg-teal-900 text-cream transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}