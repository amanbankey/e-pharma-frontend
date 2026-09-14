import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Leaf, User, Package, LogOut, ChevronDown, SlidersHorizontal,Lock } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import ProfileModal from './ProfileModal';
import toast from 'react-hot-toast';
import ChangePassword from './ChangePassword';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false)
  const dropdownRef = useRef(null);
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? 'bg-paper/90 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)]' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-700 text-cream">
              <Leaf size={18} strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl tracking-tight text-teal-900">Vernal&nbsp;Rx</span>
          </NavLink>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative text-[15px] font-medium text-ink-soft transition-colors hover:text-teal-900 ${
                    isActive ? 'text-teal-900' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative pb-1">
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-gold-600"
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/cart"
              className="relative rounded-full border border-line bg-paper p-2.5 text-teal-900 transition hover:border-teal-500"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gold-600 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </NavLink>

            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                {/* User Icon Button to toggle dropdown */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-2 text-sm font-semibold text-teal-900 transition hover:border-teal-500 ${
                    dropdownOpen ? 'border-teal-600 ring-2 ring-teal-500/20' : ''
                  }`}
                  aria-label="Open user menu"
                >
                  <User size={18} />
                  <ChevronDown
                    size={14}
                    className={`text-ink-soft transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-teal-900' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-line bg-paper p-2 shadow-xl z-50"
                    >
                      {/* User brief info */}
                      <div className="px-3 py-2.5 border-b border-line mb-1">
                        <p className="text-sm font-semibold text-teal-900 truncate">
                          {user?.fullName || 'My Account'}
                        </p>
                        <p className="text-xs text-ink-soft truncate">{user?.email}</p>
                      </div>

                      {/* Profile Tab / Option */}
                       <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowChangePassword(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-teal-900 transition hover:bg-teal-50 hover:text-teal-800"
                      >
                        <Lock size={16} className="text-teal-700"/>
                        <span>Change Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-teal-900 transition hover:bg-teal-50 hover:text-teal-800"
                      >
                        <SlidersHorizontal size={16} className="text-teal-700" />
                        <span>Profile</span>
                      </button>

                      {/* Orders Tab / Option */}
                      <NavLink
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-teal-900 transition hover:bg-teal-50 hover:text-teal-800"
                      >
                        <Package size={16} className="text-teal-700" />
                        <span>My Orders</span>
                      </NavLink>

                      {/* Divider */}
                      <div className="my-1 border-t border-line" />

                      {/* Sign Out Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="hidden rounded-full bg-teal-900 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal-700 md:inline-block"
              >
                Sign in
              </NavLink>
            )}

            <button
              className="p-1 text-teal-900 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-line bg-paper md:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-teal-100 hover:text-teal-900"
                  >
                    {l.label}
                  </NavLink>
                ))}

                {isAuthenticated ? (
                  <>
                    <div className="my-2 border-t border-line pt-2">
                      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        {user?.fullName || 'Account'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-teal-900 hover:bg-teal-100 text-left"
                    >
                      <SlidersHorizontal size={16} />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setShowChangePassword(true);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-teal-900 hover:bg-teal-100 text-left"
                    >
                      <Lock size={16} />
                      <span>Change Password</span>
                    </button>
                    <NavLink
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-teal-900 hover:bg-teal-100"
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </NavLink>
                    <button
                      onClick={() => {
                        toast.success("Sign out successfully")
                        logout();
                        setOpen(false);
                      }}
                      className="mt-2 flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-2.5 text-center text-sm font-semibold text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-full bg-teal-900 px-5 py-2.5 text-center text-sm font-semibold text-cream"
                  >
                    Sign in
                  </NavLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      
      {showChangePassword && (
         <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
     
    </>
  );
}
