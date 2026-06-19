import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { Mascota } from '../types';

class PetService {
  private baseUrl = API_CONFIG.pet;

  async getAll(): Promise<Mascota[]> {
    try {
      const response = await authFetch(this.baseUrl);
      const data = await response.json();
      if (data._embedded?.mascotaList) return data._embedded.mascotaList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Mascota> {
    const response = await authFetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Mascota no encontrada');
    return response.json();
  }

  async create(mascota: Mascota): Promise<Mascota> {
    const response = await authFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mascota)
    });
    if (!response.ok) throw new Error('Error al crear mascota');
    return response.json();
  }

  async update(id: string, mascota: Mascota): Promise<Mascota> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mascota)
    });
    if (!response.ok) throw new Error('Error al actualizar mascota');
    return response.json();
  }

  async updateStatus(id: string, nuevoEstado: string, founderId?: string): Promise<Mascota> {
    const url = new URL(`${this.baseUrl}/${id}/status`);
    url.searchParams.append('nuevoEstado', nuevoEstado);
    if (founderId) url.searchParams.append('founderId', founderId);
    
    const response = await authFetch(url.toString(), {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Error al actualizar estado');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  async getByStatus(status: 'LOST' | 'FOUND' | 'REUNITED'): Promise<Mascota[]> {
    const all = await this.getAll();
    return all.filter(pet => pet.status === status);
  }
}

export default new PetService();