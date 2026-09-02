// src/service/geo.service.ts
import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { Ubicacion } from '../types';

class GeoService {
  private baseUrl = API_CONFIG.geo;

  async getAll(): Promise<Ubicacion[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/api/geolocalizacion`);
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
    const response = await authFetch(`${this.baseUrl}/api/geolocalizacion/${id}`);
    if (!response.ok) throw new Error('Ubicación no encontrada');
    return response.json();
  }

  async getByPetId(petId: string): Promise<Ubicacion[]> {
    try {
      console.log(`getByPetId - petId: ${petId}`);
      const response = await authFetch(`${this.baseUrl}/api/geolocalizacion/reporte/${petId}`);
      
      if (response.status === 404) {
        console.log(`ℹ️ No se encontraron ubicaciones para petId: ${petId}`);
        return [];
      }
      
      if (!response.ok) {
        console.log(`Error al obtener ubicaciones: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      if (data._embedded?.ubicacionList) return data._embedded.ubicacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error(`Error fetching locations for pet ${petId}:`, error);
      return [];
    }
  }

  async getUbicacionesByUserId(userId: string): Promise<Ubicacion[]> {
    try {
      console.log('getUbicacionesByUserId - userId:', userId);
      
      const petsResponse = await authFetch(`${API_CONFIG.pet}/api/mascotas?ownerId=${userId}`);
      
      if (!petsResponse.ok) {
        console.error('Error al obtener mascotas:', petsResponse.status);
        return [];
      }
      
      const petsData = await petsResponse.json();
      let allPets = [];
      if (petsData._embedded?.mascotaList) {
        allPets = petsData._embedded.mascotaList;
      } else if (Array.isArray(petsData)) {
        allPets = petsData;
      }
      
      console.log(`Total de mascotas del usuario: ${allPets.length}`);
      
      if (allPets.length === 0) {
        console.log('ℹ️ El usuario no tiene mascotas');
        return [];
      }
      
      const ubicacionesPromises = allPets.map(async (pet: any) => {
        if (!pet.id) return [];
        try {
          return await this.getByPetId(pet.id);
        } catch (error) {
          console.error(`Error fetching ubicaciones for pet ${pet.id}:`, error);
          return [];
        }
      });
      
      const ubicacionesArrays = await Promise.all(ubicacionesPromises);
      const todasUbicaciones = ubicacionesArrays.flat();
      
      console.log(`Total ubicaciones del usuario: ${todasUbicaciones.length}`);
      return todasUbicaciones;
    } catch (error) {
      console.error('Error en getUbicacionesByUserId:', error);
      return [];
    }
  }

  async getUbicacionesByUserIdAlt(userId: string): Promise<Ubicacion[]> {
    try {
      console.log('getUbicacionesByUserIdAlt - userId:', userId);
      
      const todasUbicaciones = await this.getAll();
      console.log(`Total de ubicaciones en sistema: ${todasUbicaciones.length}`);
      
      if (todasUbicaciones.length === 0) {
        console.log('ℹ️ No hay ubicaciones en el sistema');
        return [];
      }
      
      const petsResponse = await authFetch(`${API_CONFIG.pet}/api/mascotas`);
      if (!petsResponse.ok) {
        console.error('❌ Error al obtener mascotas');
        return [];
      }
      
      const petsData = await petsResponse.json();
      let allPets = [];
      if (petsData._embedded?.mascotaList) {
        allPets = petsData._embedded.mascotaList;
      } else if (Array.isArray(petsData)) {
        allPets = petsData;
      }
      
      console.log(`Total de mascotas en sistema: ${allPets.length}`);
      
      const userPets = allPets.filter((pet: any) => pet.ownerId === userId);
      const userPetIds = userPets.map((pet: any) => pet.id);
      
      console.log(`Mascotas del usuario: ${userPets.length}`);
      console.log(`IDs de mascotas del usuario:`, userPetIds);
      
      const ubicacionesFiltradas = todasUbicaciones.filter(
        (ubicacion: any) => userPetIds.includes(ubicacion.reportId)
      );
      
      console.log(`Ubicaciones filtradas: ${ubicacionesFiltradas.length}`);
      return ubicacionesFiltradas;
    } catch (error) {
      console.error('Error en getUbicacionesByUserIdAlt:', error);
      return [];
    }
  }

  async getNearby(lng: number, lat: number, radiusKm: number = 5.0): Promise<Ubicacion[]> {
    try {
      const url = new URL(`${this.baseUrl}/api/geolocalizacion/cercanos`);
      url.searchParams.append('lng', lng.toString());
      url.searchParams.append('lat', lat.toString());
      url.searchParams.append('radio', radiusKm.toString());
      
      const response = await authFetch(url.toString());
      if (!response.ok) return [];
      const data = await response.json();
      if (data._embedded?.ubicacionList) return data._embedded.ubicacionList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      return [];
    }
  }

  async create(ubicacion: any): Promise<Ubicacion> {
    console.log('📝 Creando ubicación:', ubicacion);
    try {
      const response = await authFetch(`${this.baseUrl}/api/geolocalizacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: ubicacion.reportId,
          descripcion: ubicacion.descripcion || '',
          fechaRegistro: ubicacion.fechaRegistro || new Date().toISOString(),
          posicion: {
            type: 'Point',
            coordinates: ubicacion.posicion?.coordinates || [ubicacion.longitud || 0, ubicacion.latitud || 0]
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error al crear ubicación:', errorText);
        throw new Error(`Error al crear ubicación: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Ubicación creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en create:', error);
      throw error;
    }
  }

  async update(id: string, ubicacion: Ubicacion): Promise<Ubicacion> {
    const response = await authFetch(`${this.baseUrl}/api/geolocalizacion/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ubicacion)
    });
    if (!response.ok) throw new Error('Error al actualizar ubicación');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/api/geolocalizacion/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

export default new GeoService();