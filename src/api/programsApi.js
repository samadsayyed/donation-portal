import api from './axios';
import { ENDPOINTS } from './endpoints';

export const programApi = {
    getPrograms: (category) => api.get(`${ENDPOINTS.PROGRAMS}/${category}`), // Assuming category is used as a query param
};
