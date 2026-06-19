// src/service/user.service.ts
import API_CONFIG from './api.config';
import { authFetch, setStoredUser, getStoredUser } from './auth.service';
import type { Usuario } from '../types';

class UserService {
  private baseUrl = API_CONFIG.user;

  async getAll(): Promise<Usuario[]> {
    try {
      const response = await authFetch(this.baseUrl);
      const data = await response.json();
      if (data._embedded?.usuarioList) return data._embedded.usuarioList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Usuario> {
    const response = await authFetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Usuario no encontrado');
    return response.json();
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role?: string;
  }): Promise<Usuario> {
    let backendRole = 'ROLE_USER';
    
    if (userData.role === 'ADMIN') {
      backendRole = 'ROLE_ADMIN';
    } else if (userData.role === 'CITIZEN') {
      backendRole = 'ROLE_USER';
    }
    
    const response = await authFetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone || '',
        role: backendRole,
        active: true,
        petsIds: [],
        refreshToken: null
      })
    });
    
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('El email ya está registrado');
      }
      if (response.status === 403) {
        throw new Error('No tienes permiso para registrar usuarios.');
      }
      const error = await response.text();
      throw new Error(error || 'Error al registrar usuario');
    }
    
    const data = await response.json();
    return data.usuario || data;
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password })
    });
    
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Login failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }

    const data = await response.json();
    const user = (data.usuario ?? data.user ?? data) as Usuario;
    
    const token = data.token ?? data.accessToken ?? user.token ?? user.accessToken;
    
    const userWithToken: Usuario = {
      ...user,
      token: token,
      accessToken: token,
      refreshToken: data.refreshToken ?? user.refreshToken
    };
    
    setStoredUser(userWithToken);
    return userWithToken;
  }

  // Obtener mascotas del usuario actual con fallback
  async getMyPets(userId: string): Promise<any[]> {
    console.log('🔍 getMyPets - Buscando mascotas para userId:', userId);
    
    try {
      // Intentar obtener del endpoint específico del usuario
      const response = await authFetch(`${this.baseUrl}/${userId}/pets`);
      
      if (response.ok) {
        const data = await response.json();
        const pets = data._embedded?.mascotaList || data || [];
        console.log('getMyPets - Mascotas encontradas (endpoint usuario):', pets.length);
        return pets;
      }
      
      // Si el endpoint falla, hacer fallback: obtener todas y filtrar
      console.log('getMyPets - Fallback: obteniendo todas las mascotas');
      const allPetsResponse = await authFetch(API_CONFIG.pet);
      
      if (!allPetsResponse.ok) {
        console.error('getMyPets - Error al obtener todas las mascotas');
        return [];
      }
      
      const allData = await allPetsResponse.json();
      const allPets = allData._embedded?.mascotaList || allData || [];
      
      console.log('getMyPets - Total de mascotas:', allPets.length);
      
      // Filtrar por ownerId
      const userPets = allPets.filter((pet: any) => pet.ownerId === userId);
      
      console.log(`getMyPets - Mascotas filtradas para usuario ${userId}:`, userPets.length);
      console.log('getMyPets - Detalle:', userPets);
      
      return userPets;
    } catch (error) {
      console.error('getMyPets - Error:', error);
      
      // Último intento: obtener todas y filtrar
      try {
        console.log('getMyPets - Último intento: obtener todas las mascotas');
        const response = await authFetch(API_CONFIG.pet);
        if (!response.ok) return [];
        const data = await response.json();
        const allPets = data._embedded?.mascotaList || data || [];
        const userPets = allPets.filter((pet: any) => pet.ownerId === userId);
        console.log(`getMyPets - Mascotas encontradas en último intento:`, userPets.length);
        return userPets;
      } catch (finalError) {
        console.error('getMyPets - Error en último intento:', finalError);
        return [];
      }
    }
  }

  async update(id: string, usuario: Usuario): Promise<Usuario> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  getCurrentUser(): Usuario | null {
    return getStoredUser();
  }

  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }
}

export default new UserService();