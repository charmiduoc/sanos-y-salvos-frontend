// src/service/user.service.ts
import API_CONFIG from './api.config';
import { authFetch, setStoredUser, getStoredUser } from './auth.service';
import type { Usuario } from '../types';

// Tipo para actualizar usuario (incluye password opcional)
type UserUpdateData = Partial<Usuario> & {
  password?: string;
};

class UserService {
  private baseUrl = API_CONFIG.user;

  async getAll(): Promise<Usuario[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/api/usuarios`);
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
    const response = await authFetch(`${this.baseUrl}/api/usuarios/${id}`);
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
    
    const response = await fetch(`${this.baseUrl}/api/usuarios/register`, {
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
        throw new Error('El email ya esta registrado');
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
    console.log('Intentando login con:', credentials.email);
    
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: credentials.email, 
        password: credentials.password 
      })
    });
    
    if (!response.ok) {
      const body = await response.text();
      console.error('Error en login:', response.status, body);
      throw new Error(`Login failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }

    const data = await response.json();
    console.log('Respuesta del login:', data);
    
    const user = data.usuario ?? data.user ?? data;
    const token = data.token ?? data.accessToken ?? user.token ?? user.accessToken;
    
    if (!token) {
      console.error('No se encontro token en la respuesta');
      throw new Error('No se pudo obtener el token de autenticacion');
    }
    
    const userWithToken: Usuario = {
      ...user,
      token: token,
      accessToken: token,
      refreshToken: data.refreshToken ?? user.refreshToken
    };
    
    console.log('Usuario con token:', userWithToken);
    
    setStoredUser(userWithToken);
    
    if (userWithToken.refreshToken) {
      localStorage.setItem('refresh_token', userWithToken.refreshToken);
    }
    
    return userWithToken;
  }

  async getMyPets(userId: string): Promise<any[]> {
    console.log('getMyPets - Buscando mascotas para userId:', userId);
    
    try {
      const response = await authFetch(`${API_CONFIG.pet}/api/mascotas?ownerId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const pets = data._embedded?.mascotaList || data || [];
        console.log('getMyPets - Mascotas encontradas:', pets.length);
        return pets;
      }
      
      console.log('getMyPets - Fallback: obteniendo todas las mascotas');
      const allPetsResponse = await authFetch(`${API_CONFIG.pet}/api/mascotas`);
      
      if (!allPetsResponse.ok) {
        console.error('getMyPets - Error al obtener todas las mascotas');
        return [];
      }
      
      const allData = await allPetsResponse.json();
      const allPets = allData._embedded?.mascotaList || allData || [];
      
      console.log('getMyPets - Total de mascotas:', allPets.length);
      
      const userPets = allPets.filter((pet: any) => pet.ownerId === userId);
      
      console.log(`getMyPets - Mascotas filtradas para usuario ${userId}:`, userPets.length);
      
      return userPets;
    } catch (error) {
      console.error('getMyPets - Error:', error);
      return [];
    }
  }

  async update(id: string, userData: UserUpdateData): Promise<Usuario> {
    console.log('Actualizando usuario:', id, userData);
    
    const currentUser = getStoredUser();
    
    const payload: any = {
      id: id,
      email: userData.email || '',
      name: userData.name || '',
      phone: userData.phone || '',
      role: userData.role || 'ROLE_USER',
      active: userData.active !== undefined ? userData.active : true,
      petsIds: userData.petsIds || [],
      refreshToken: currentUser?.refreshToken || null
    };

    if (userData.password) {
      payload.password = userData.password;
    }

    console.log('Payload enviado:', payload);

    const response = await authFetch(`${this.baseUrl}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al actualizar:', errorText);
      throw new Error(`Error al actualizar usuario: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Usuario actualizado:', result);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/api/usuarios/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  getCurrentUser(): Usuario | null {
    return getStoredUser();
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }
}

export default new UserService();