# Vernal Rx — Frontend

React + Vite + Tailwind CSS v4 storefront for an online pharmacy: category-wise products, cart, Razorpay checkout, profile with order & delivery tracking, WhatsApp button, Google Map on the contact page, and page-load / scroll animations via Framer Motion.

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_API_URL and VITE_RAZORPAY_KEY
npm run dev
```

## Structure

```
src/
  components/   Navbar, Footer, ProductCard, WhatsappButton
  pages/        Home, Products, About, Contact, Cart, Login, Signup, Profile
  lib/          api.js (backend calls), CartContext.jsx
  data/         products.js — sample catalogue with placeholder image links,
                swap for real product images/API data when ready
```

## Connecting to the backend

`src/lib/api.js` calls the endpoints in the backend zip (`/api/...`). Update
`VITE_API_URL` in `.env` to point at your deployed backend, and replace the
`products.js` sample data with a fetch from `/api/products` once the backend
is live.

## Notes

- Product images are placeholder Unsplash links — swap in your own product
  photography before going live.
- The WhatsApp number and map location in `Footer.jsx` / `Contact.jsx` are
  placeholders — update to your real business number and address.
