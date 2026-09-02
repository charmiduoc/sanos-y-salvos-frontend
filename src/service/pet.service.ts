// src/service/pet.service.ts
import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { Mascota, CrearMascota, ActualizarMascota } from '../types';

class PetService {
  private baseUrl = API_CONFIG.pet;

  async getAll(): Promise<Mascota[]> {
    try {
      console.log('Obteniendo todas las mascotas desde:', `${this.baseUrl}/api/mascotas`);
      const response = await authFetch(`${this.baseUrl}/api/mascotas`);
      const data = await response.json();
      console.log('Respuesta recibida:', data);
      
      if (data._embedded?.mascotaList) return data._embedded.mascotaList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Mascota> {
    console.log('📥 Obteniendo mascota:', id);
    const response = await authFetch(`${this.baseUrl}/api/mascotas/${id}`);
    if (!response.ok) throw new Error('Mascota no encontrada');
    return response.json();
  }

  async create(mascota: CrearMascota): Promise<Mascota> {
    console.log('Creando mascota en:', `${this.baseUrl}/api/mascotas`);
    console.log('Datos:', JSON.stringify(mascota, null, 2));
    
    const response = await authFetch(`${this.baseUrl}/api/mascotas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mascota)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al crear mascota:', errorText);
      throw new Error(`Error al crear mascota: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Mascota creada:', result);
    return result;
  }

  async update(id: string, mascota: ActualizarMascota): Promise<Mascota> {
    console.log('Actualizando mascota:', id);
    const response = await authFetch(`${this.baseUrl}/api/mascotas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mascota)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar mascota: ${errorText}`);
    }
    return response.json();
  }

  async updateStatus(id: string, nuevoEstado: string, founderId?: string): Promise<Mascota> {
    console.log('Actualizando estado:', id, nuevoEstado);
    const url = new URL(`${this.baseUrl}/api/mascotas/${id}/status`);
    url.searchParams.append('nuevoEstado', nuevoEstado);
    if (founderId) url.searchParams.append('founderId', founderId);
    
    const response = await authFetch(url.toString(), {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Error al actualizar estado');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    console.log('Eliminando mascota:', id);
    const response = await authFetch(`${this.baseUrl}/api/mascotas/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  async getByStatus(status: 'LOST' | 'FOUND' | 'REUNITED'): Promise<Mascota[]> {
    const all = await this.getAll();
    return all.filter(pet => pet.status === status);
  }

  async getByOwner(ownerId: string): Promise<Mascota[]> {
    const all = await this.getAll();
    return all.filter(pet => pet.ownerId === ownerId);
  }
}

export default new PetService();