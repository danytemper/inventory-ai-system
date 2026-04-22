import axios from 'axios';

// All requests go through the API Gateway on port 8082
const GATEWAY_URL = 'http://localhost:8082';

const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Inventory APIs
export const inventoryAPI = {
  getAllProducts: () => api.get('/gateway/inventory/products'),
  getProductById: (id) => api.get(`/gateway/inventory/products/${id}`),
  getProductsByStore: (storeId) => api.get(`/gateway/inventory/products/store/${storeId}`),
  getLowStockProducts: () => api.get('/gateway/inventory/products/low-stock'),
  createProduct: (data) => api.post('/gateway/inventory/products', data),
  updateStock: (id, quantity) => api.patch(`/gateway/inventory/products/${id}/stock?quantity=${quantity}`),
  deleteProduct: (id) => api.delete(`/gateway/inventory/products/${id}`)
};

// AI Prediction APIs
export const predictionAPI = {
  predict: (data) => api.post('/gateway/predictions/predict', data),
  predictBatch: (data) => api.post('/gateway/predictions/predict/batch', data)
};

// Health check
export const healthAPI = {
  getAllHealth: () => api.get('/health')
};
