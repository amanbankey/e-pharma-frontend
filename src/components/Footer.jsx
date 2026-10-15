import { Link } from 'react-router-dom';
import { Leaf, Camera, Users2, Send, ShieldCheck, Truck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-teal-900 text-cream/90">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-600 text-teal-900">
              <Leaf size={18} strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl text-cream">Vernal Rx</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            Licensed pharmacy products, sourced and verified, delivered to your door in every corner of India.
          </p>
          <div className="mt-5 flex gap-3">
            {[Camera, Users2, Send].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-cream/20 transition hover:border-gold-400 hover:text-gold-400">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-cream">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-gold-400">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold-400">Products</Link></li>
            <li><Link to="/about" className="hover:text-gold-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold-400">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-cream">Support</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>Mon – Sat, 9am – 8pm</li>
            <li>care@vernalrx.com</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-cream">Why Vernal Rx</h4>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-gold-400" /> Verified pharmacy</li>
            <li className="flex items-center gap-2"><Truck size={16} className="text-gold-400" /> Same-day dispatch</li>
            <li className="flex items-center gap-2"><Clock size={16} className="text-gold-400" /> 24×7 pharmacist support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Vernal Rx. All rights reserved.
      </div>
    </footer>
  );
}
