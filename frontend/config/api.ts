// API Configuration for MongoDB Backend
const API_CONFIG = {
  // TODO: Replace with your actual backend URL
  // For development: 'http://localhost:3000/api'
  // For production: 'https://your-domain.com/api'
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
};

export default API_CONFIG;