const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log(BASE_URL)

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers,
      ...options,
    });
  } catch {
    throw new Error('Unable to reach the server. Please check your internet connection and try again.');
  }

  const data = await res.json().catch(() => ({}));

  // If token is expired or invalid (HTTP 401), clean up and redirect to login
  if (
    res.status === 401 ||
    (typeof data?.message === 'string' &&
      (data.message.toLowerCase().includes('expired token') ||
        data.message.toLowerCase().includes('token is missing') ||
        data.message.toLowerCase().includes('invalid token')))
  ) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:expired'));

    // Redirect to login page if on a protected route
    if (
      typeof window !== 'undefined' &&
      !['/login', '/signup', '/forget-password', '/update-password'].includes(
        window.location.pathname
      )
    ) {
      window.location.href = '/login';
    }
  }

  if (!res.ok || data.success === false) {
    if (res.status === 429) {
      throw new Error(data.message || 'Too many attempts. Please wait a few minutes and try again.');
    }
    if (res.status >= 500 && !data.message) {
      throw new Error('Our server ran into a problem. Please try again in a moment.');
    }
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const authApi = {
  sendMobileOtp: (phone) => request('/mobile-send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  mobileSignup: (payload) => request('/mobile-signup', { method: 'POST', body: JSON.stringify(payload) }),
  mobileLogin: (payload) => request('/mobile-login', { method: 'POST', body: JSON.stringify(payload) }),
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

export const contactApi = {
  send: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
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


export const mapProduct = (p) => {
  const images = (Array.isArray(p.images) && p.images.length > 0)
    ? p.images
    : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80']);

  return {
    id: p._id || p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit || 'Standard Pack',
    composition: p.composition || '',
    manufacturer: p.manufacturer || 'Vernal Rx Certified',
    image: images[0],
    images,
    description: p.description || '',
    expiryDate: p.expiryDate || null,
    prescriptionRequired: Boolean(p.prescriptionRequired),
    totalStock: p.totalStock ?? 0,
    availableStock: p.availableStock ?? Math.max((p.totalStock || 0) - (p.reservedStock || 0), 0),
  };
};