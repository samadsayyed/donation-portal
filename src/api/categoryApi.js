import api from './axios';
import { ENDPOINTS } from './endpoints';

export const categoryApi = {
  getCategories: () => api.get(ENDPOINTS.CATEGORIES)
};