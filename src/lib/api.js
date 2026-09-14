const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log(BASE_URL)

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

export const authApi = {
  sendOtp: (email) => request('/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  signup: (payload) => request('/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/me'),
  updateProfile: (payload) => request('/me', { method: 'PUT', body: JSON.stringify(payload) }),
  resetPasswordToken: (payload) => request('/reset-password-token', {method: 'POST', body: JSON.stringify(payload)}), 
  resetPassword: (payload) => request('/reset-password', {method: 'POST', body: JSON.stringify(payload)}), 
  changePassword: (payload) => request('/change-password', {method: 'POST', body: JSON.stringify(payload)}),
};


export const productApi = {
  getAll: () => request('/products'),
  getByCategory: (category) => request(`/products?category=${category}`),
  getById: (id) => request(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => request('/categories'),
};

export const orderApi = {
  createOrder: (payload) => request('/payments/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  createCodOrder: (payload) => request('/payments/create-cod-order', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) => request('/payments/verify-payment', { method: 'POST', body: JSON.stringify(payload) }),
  myOrders: () => request('/payments/my-orders'),
};

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existing = document.getElementById('razorpay-sdk');
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}


export const mapProduct = (p) => ({
  id: p._id,
  name: p.name,
  category: p.category,
  price: p.price,
  mrp: p.mrp,
  unit: p.unit,
  composition: p.composition,
  manufacturer: p.manufacturer,
  image: p.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  prescriptionRequired: p.prescriptionRequired,
  availableStock: p.availableStock ?? Math.max((p.totalStock || 0) - (p.reservedStock || 0), 0),
});