import API_CONFIG from './api.config';
import type { Usuario } from '../types';

class UserService {
  private baseUrl = API_CONFIG.user;

  async getAll(): Promise<Usuario[]> {
    try {
      const response = await fetch(this.baseUrl);
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
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Usuario no encontrado');
    return response.json();
  }

  async register(usuario: Usuario): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (!response.ok) throw new Error('Error al registrar usuario');
    return response.json();
  }

  async login(credentials: { email: string; password: string }): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Credenciales inválidas');
    return response.json();
  }

  async update(id: string, usuario: Usuario): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

export default new UserService();