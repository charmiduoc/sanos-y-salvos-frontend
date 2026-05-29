// Usa las URLs de Render que proporcionaste
const API_CONFIG = {
  user: import.meta.env.VITE_API_USER || 'https://microuser.onrender.com/api/usuarios',
  pet: import.meta.env.VITE_API_PET || 'https://micropet.onrender.com/api/mascotas',
  geo: import.meta.env.VITE_API_GEO || 'https://microgeo.onrender.com/api/geolocalizacion',
  image: import.meta.env.VITE_API_IMAGE || 'https://microimg.onrender.com/api/images',
  notification: import.meta.env.VITE_API_NOTIFICATION || 'https://micronotif.onrender.com/api/notificaciones',
  match: import.meta.env.VITE_API_MATCH || 'https://micromatch-ztg5.onrender.com/api/matches'
};

// Helper para manejar respuestas HATEOAS
export const extractDataFromHateoas = <T>(response: any): T[] => {
  if (!response) return [];
  // Busca el primer array en _embedded
  if (response._embedded) {
    const firstKey = Object.keys(response._embedded)[0];
    return response._embedded[firstKey] || [];
  }
  // Si es un array directamente
  if (Array.isArray(response)) return response;
  return [];
};

export default API_CONFIG;