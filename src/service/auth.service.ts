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
      clearStoredUser();
      return null;
    }
    
    return user;
  } catch {
    clearStoredUser();
    return null;
  }
};

/**
 * Almacena el usuario en localStorage.
 */
export const setStoredUser = (user: Usuario): void => {
  if (!user.expiration) {
    user.expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

/**
 * Limpia los datos del usuario.
 */
export const clearStoredUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_REFRESH_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

/**
 * Obtiene el token JWT del usuario.
 */
export const getToken = (): string | null => {
  const user = getStoredUser();
  if (!user) return null;
  return user.token ?? user.accessToken ?? null;
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
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_CONFIG.user}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });

    if (!response.ok) {
      clearStoredUser();
      return null;
    }

    const data = await response.json();
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

/**
 * Crea los headers con el token JWT.
 */
const mergeHeaders = (headers?: HeadersInit): Headers => {
  const finalHeaders = new Headers(headers);
  const token = getToken();
  
  if (token && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }
  
  if (!finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  
  return finalHeaders;
};

/**
 * Fetch con autenticación automática y manejo de token expirado.
 */
export const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  try {
    let response = await fetch(input, {
      ...init,
      headers: mergeHeaders(init.headers)
    });

    // Si el token expiró, intentar refrescar
    if (response.status === 401) {
      const newUser = await refreshToken();
      
      if (newUser) {
        // Reintentar la petición con el nuevo token
        response = await fetch(input, {
          ...init,
          headers: mergeHeaders(init.headers)
        });
      } else {
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