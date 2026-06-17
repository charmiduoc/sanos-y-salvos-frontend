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
    // Convertir el rol al formato que espera el backend (con prefijo ROLE_)
    let backendRole = 'ROLE_USER'; // valor por defecto
    
    if (userData.role === 'ADMIN') {
      backendRole = 'ROLE_ADMIN';
    } else if (userData.role === 'CITIZEN') {
      backendRole = 'ROLE_USER';
    }
    
    console.log('🔄 Convirtiendo rol:', userData.role, '→', backendRole);
    
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
        throw new Error('No tienes permiso para registrar usuarios. Asegúrate de haber iniciado sesión como administrador.');
      }
      const error = await response.text();
      throw new Error(error || 'Error al registrar usuario');
    }
    
    const data = await response.json();
    return data.usuario || data;
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<Usuario> {
    console.log('🔐 Intentando login para:', credentials.email);
    
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
    
    // Extraer el token de la respuesta
    const token = data.token ?? data.accessToken ?? user.token ?? user.accessToken;
    
    const userWithToken: Usuario = {
      ...user,
      token: token,
      accessToken: token,
      refreshToken: data.refreshToken ?? user.refreshToken
    };
    
    console.log('✅ Login exitoso - Rol del usuario:', userWithToken.role);
    
    // Guardar el usuario completo (con token) en localStorage
    setStoredUser(userWithToken);
    
    return userWithToken;
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

  // Método para obtener el usuario actualmente logueado
  getCurrentUser(): Usuario | null {
    return getStoredUser();
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }
}

export default new UserService();