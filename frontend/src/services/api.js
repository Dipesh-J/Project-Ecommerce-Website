import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  // Register a new user
  register: async (formData) => {
    const response = await api.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get(`/user/${userId}/profile`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, formData) => {
    const response = await api.put(`/user/${userId}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== PRODUCTS API ====================

export const productsAPI = {
  // Get all products with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.size) params.append('size', filters.size);
    if (filters.priceGreaterThan) params.append('priceGreaterThan', filters.priceGreaterThan);
    if (filters.priceLessThan) params.append('priceLessThan', filters.priceLessThan);
    if (filters.priceSort) params.append('priceSort', filters.priceSort);
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get product by ID
  getById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Create product (admin)
  create: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (admin)
  update: async (productId, formData) => {
    const response = await api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product (admin)
  delete: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },
};

// ==================== CART API ====================

export const cartAPI = {
  // Get cart for user
  get: async (userId) => {
    const response = await api.get(`/users/${userId}/cart`);
    return response.data;
  },

  // Add item to cart
  addItem: async (userId, data) => {
    const response = await api.post(`/users/${userId}/cart`, data);
    return response.data;
  },

  // Update cart item (reduce quantity or remove)
  updateItem: async (userId, data) => {
    const response = await api.put(`/users/${userId}/cart`, data);
    return response.data;
  },

  // Clear cart
  clear: async (userId) => {
    const response = await api.delete(`/users/${userId}/cart`);
    return response.data;
  },
};

// ==================== ORDERS API ====================

export const ordersAPI = {
  // Create order from cart
  create: async (userId, data) => {
    const response = await api.post(`/users/${userId}/orders`, data);
    return response.data;
  },

  // Update order status
  updateStatus: async (userId, data) => {
    const response = await api.put(`/users/${userId}/orders`, data);
    return response.data;
  },
};

export default api;
