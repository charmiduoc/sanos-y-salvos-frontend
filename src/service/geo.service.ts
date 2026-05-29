import API_CONFIG from './api.config';
import type { Ubicacion } from '../types';

class GeoService {
  private baseUrl = API_CONFIG.geo;

  async getAll(): Promise<Ubicacion[]> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();
      if (data._embedded?.ubicacionList) return data._embedded.ubicacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Ubicacion> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Ubicación no encontrada');
    return response.json();
  }

  async getByPetId(petId: string): Promise<Ubicacion[]> {
    const response = await fetch(`${this.baseUrl}/pet/${petId}`);
    const data = await response.json();
    if (data._embedded?.ubicacionList) return data._embedded.ubicacionList;
    if (Array.isArray(data)) return data;
    return [];
  }

  async getNearby(lng: number, lat: number, radiusKm: number = 5.0): Promise<Ubicacion[]> {
    const url = new URL(`${this.baseUrl}/nearby`);
    url.searchParams.append('lng', lng.toString());
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('radio', radiusKm.toString());
    
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data._embedded?.ubicacionList) return data._embedded.ubicacionList;
    if (Array.isArray(data)) return data;
    return [];
  }

  async create(ubicacion: Ubicacion): Promise<Ubicacion> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ubicacion)
    });
    if (!response.ok) throw new Error('Error al crear ubicación');
    return response.json();
  }

  async update(id: string, ubicacion: Ubicacion): Promise<Ubicacion> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ubicacion)
    });
    if (!response.ok) throw new Error('Error al actualizar ubicación');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

export default new GeoService();