// src/service/auth.service.ts
import type { Usuario } from '../types';
import API_CONFIG from './api.config';

const STORAGE_KEY = 'user';
const TOKEN_REFRESH_KEY = 'refresh_token';

/**
 * Obtiene el usuario almacenado en localStorage.
 */
export const getStoredUser = (): Usuario | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const user = JSON.parse(stored) as Usuario;
    
    // Verificar expiración
    if (user.expiration && new Date(user.expiration) < new Date()) {
      console.log('⏰ Token expirado, limpiando...');
      clearStoredUser();
      return null;
    }
    
    console.log('Usuario recuperado de localStorage:', user.email);
    return user;
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    clearStoredUser();
    return null;
  }
};
export const setStoredUser = (user: Usuario): void => {
  // Asegurar que el token esté presente
  if (!user.token && user.accessToken) {
    user.token = user.accessToken;
  }
  
  if (!user.expiration) {
    user.expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  console.log('Usuario guardado en localStorage:', user.email);
};

/**
 * Limpia los datos del usuario.
 */
export const clearStoredUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_REFRESH_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  console.log('Datos de usuario eliminados');
};

/**
 * Obtiene el token JWT del usuario.
 */
export const getToken = (): string | null => {
  const user = getStoredUser();
  if (!user) return null;
  const token = user.token ?? user.accessToken ?? null;
  console.log('Token obtenido:', token ? ` ${token.substring(0, 20)}...` : '❌ No existe');
  return token;
};

/**
 * Obtiene el refresh token.
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(TOKEN_REFRESH_KEY);
};

/**
 * Refresca el token usando el refresh token.
 */
export const refreshToken = async (): Promise<Usuario | null> => {
  const refresh = getRefreshToken();
  if (!refresh) {
    console.log('No hay refresh token disponible');
    return null;
  }

  try {
    console.log('🔄 Refrescando token...');
    const response = await fetch(`${API_CONFIG.user}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });

    if (!response.ok) {
      console.error('Error al refrescar token:', response.status);
      clearStoredUser();
      return null;
    }

    const data = await response.json();
    console.log('Token refrescado exitosamente');
    
    const user = getStoredUser();
    
    if (user) {
      const newUser = { 
        ...user, 
        token: data.token || data.accessToken,
        refreshToken: data.refreshToken,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      setStoredUser(newUser);
      
      if (data.refreshToken) {
        localStorage.setItem(TOKEN_REFRESH_KEY, data.refreshToken);
      }
      
      return newUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error refrescando token:', error);
    clearStoredUser();
    return null;
  }
};
const mergeHeaders = (headers?: HeadersInit, isFormData: boolean = false): Headers => {
  const finalHeaders = new Headers(headers);
  const token = getToken();
  
  // Agregar Authorization si hay token
  if (token && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
    console.log('Token agregado al header');
  } else if (!token) {
    console.log('No hay token disponible');
  }
  
  if (!isFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
    console.log('Content-Type: application/json');
  } else if (isFormData) {
    console.log('FormData detectado, NO se establece Content-Type');
    // Eliminar Content-Type si existe
    finalHeaders.delete('Content-Type');
  }
  
  const headersObj = Object.fromEntries(finalHeaders.entries());
  console.log('Headers finales:', {
    ...headersObj,
    Authorization: headersObj.Authorization ? 'Bearer ***' : 'No'
  });
  
  return finalHeaders;
};

export const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  try {
    const isFormData = init.body instanceof FormData;
    
    console.log('authFetch - URL:', input);
    console.log('isFormData:', isFormData);
    console.log('Método:', init.method || 'GET');
    
    let response = await fetch(input, {
      ...init,
      headers: mergeHeaders(init.headers, isFormData)
    });

    // Si el token expiró, intentar refrescar
    if (response.status === 401) {
      console.log('Token expirado (401), intentando refrescar...');
      const newUser = await refreshToken();
      
      if (newUser) {
        console.log('Token refrescado, reintentando petición...');
        response = await fetch(input, {
          ...init,
          headers: mergeHeaders(init.headers, isFormData)
        });
      } else {
        console.log('No se pudo refrescar el token, redirigiendo a login');
        clearStoredUser();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Error en authFetch:', error);
    throw error;
  }
};

/**
 * Verifica si el usuario está autenticado.
 */
export const isAuthenticated = (): boolean => {
  const user = getStoredUser();
  return !!user;
};

/**
 * Verifica si el usuario es administrador.
 */
export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'ROLE_ADMIN';
};

/**
 * Verifica si el usuario es ciudadano.
 */
export const isCitizen = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'ROLE_USER';
};