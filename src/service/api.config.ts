// src/service/api.config.ts

const API_CONFIG = {
  user: import.meta.env.VITE_API_USER || 'https://microuser.onrender.com',
  pet: import.meta.env.VITE_API_PET || 'https://micropet.onrender.com',
  geo: import.meta.env.VITE_API_GEO || 'https://microgeo.onrender.com',
  image: import.meta.env.VITE_API_IMAGE || 'https://microimg.onrender.com',
  notification: import.meta.env.VITE_API_NOTIFICATION || 'https://micronotif.onrender.com',
  match: import.meta.env.VITE_API_MATCH || 'https://micromatch-ztg5.onrender.com'
};

// Helper para manejar respuestas HATEOAS
export const extractDataFromHateoas = <T>(response: any): T[] => {
  if (!response) return [];
  if (response._embedded) {
    const firstKey = Object.keys(response._embedded)[0];
    return response._embedded[firstKey] || [];
  }
  if (Array.isArray(response)) return response;
  return [];
};

export default API_CONFIG;