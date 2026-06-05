import type { Usuario } from '../types';

const STORAGE_KEY = 'user';

export const getStoredUser = (): Usuario | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Usuario;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setStoredUser = (user: Usuario): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getToken = (): string | null => {
  const user = getStoredUser();
  if (!user) return null;
  return user.token ?? user.accessToken ?? null;
};

const mergeHeaders = (headers?: HeadersInit): Headers => {
  const finalHeaders = new Headers(headers);
  const token = getToken();
  if (token && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }
  return finalHeaders;
};

export const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  const response = await fetch(input, {
    ...init,
    headers: mergeHeaders(init.headers)
  });

  if (response.status === 401) {
    clearStoredUser();
  }

  return response;
};
