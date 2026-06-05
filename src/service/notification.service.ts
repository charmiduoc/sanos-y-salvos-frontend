import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { Notificacion } from '../types';

class NotificationService {
  private baseUrl = API_CONFIG.notification;

  async getAll(): Promise<Notificacion[]> {
    try {
      const response = await authFetch(this.baseUrl);
      const data = await response.json();
      if (data._embedded?.notificacionList) return data._embedded.notificacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Notificacion> {
    const response = await authFetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Notificación no encontrada');
    return response.json();
  }

  async getByUserId(userId: string): Promise<Notificacion[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/user/${userId}`);
      const data = await response.json();
      if (data._embedded?.notificacionList) return data._embedded.notificacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async getActiveByUserId(userId: string): Promise<Notificacion[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/user/${userId}/activas`);
      const data = await response.json();
      if (data._embedded?.notificacionList) return data._embedded.notificacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching active notifications:', error);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await authFetch(`${this.baseUrl}/user/${userId}/cuenta`);
      return response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async create(notificacion: Notificacion): Promise<Notificacion> {
    const response = await authFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificacion)
    });
    if (!response.ok) throw new Error('Error al crear notificación');
    return response.json();
  }

  async markAsRead(id: string): Promise<Notificacion> {
    const response = await authFetch(`${this.baseUrl}/${id}/leer`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Error al marcar como leída');
    return response.json();
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await authFetch(`${this.baseUrl}/user/${userId}/leer-todas`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

export default new NotificationService();