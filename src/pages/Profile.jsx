import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  Phone,
  MapPin,
  Mail,
  CalendarCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { orderApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import ProfileModal from '../components/ProfileModal';

const statusMeta = {
  pending: { label: 'Order Pending', icon: Clock, color: 'text-amber-700 bg-amber-100' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-teal-700 bg-teal-100' },
  processing: { label: 'Processing', icon: Clock, color: 'text-gold-600 bg-gold-100' },
  packed: { label: 'Packed', icon: Package, color: 'text-blue-700 bg-blue-100' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-700 bg-indigo-100' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-purple-700 bg-purple-100' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-800 bg-emerald-100' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-700 bg-red-100' },
  returned: { label: 'Returned', icon: RotateCcw, color: 'text-rose-700 bg-rose-100' },
  refunded: { label: 'Refunded', icon: RotateCcw, color: 'text-zinc-700 bg-zinc-200' },
};

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    orderApi
      .myOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14 md:px-10">
      {/* User Info & Profile Summary Card */}
      {user && (
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-line bg-paper p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-800 text-2xl font-bold text-cream">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="font-display text-2xl text-teal-900">{user.fullName || 'User'}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <Mail size={13} /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {user.phone}
                  </span>
                )}
                {(user.city || user.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {[user.city, user.state].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-full border border-teal-700 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 self-start md:self-auto"
          >
            <SlidersHorizontal size={15} />
            <span>Edit Profile</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-teal-900">My orders</h1>
          <p className="mt-1 text-sm text-ink-soft">Track what you bought and when it's arriving.</p>
        </div>
      </div>

      {loading && <p className="mt-10 text-ink-soft">Loading orders…</p>}
      {error && <p className="mt-10 text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-line bg-paper py-16 text-center">
          <Package size={30} className="text-teal-700" />
          <p className="mt-4 font-display text-xl text-teal-900">No orders yet</p>
          <p className="mt-1 text-sm text-ink-soft">Your purchase history will show up here.</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order, i) => {
          const currentStatusKey = order.orderStatus || order.deliveryStatus || 'processing';
          const meta = statusMeta[currentStatusKey] || statusMeta.processing;
          const Icon = meta.icon;
          const orderIdentifier = order.orderId || (order._id ? `#${order._id.slice(-6).toUpperCase()}` : 'Order');

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-line bg-paper p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-teal-900">{orderIdentifier}</p>
                  <p className="text-sm text-ink-soft">
                    {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      order.paymentMethod === 'cod'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online (Razorpay)'}
                  </span>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${meta.color}`}>
                    <Icon size={14} /> {meta.label}
                  </span>
                </div>
              </div>

              <div className="mt-4 divide-y divide-line border-t border-line">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-ink">{item.name || item.product} × {item.qty}</span>
                    <span className="text-ink-soft">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="font-display text-lg text-teal-900">Total ₹{order.totalAmount}</p>
                {order.expectedDeliveryDate ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-900 border border-teal-200">
                    <CalendarCheck size={14} className="text-teal-700" />
                    <span>
                      Expected Delivery: <strong>{new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-ink-soft">Delivery date will be updated soon</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}
