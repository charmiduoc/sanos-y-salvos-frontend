// src/service/geo.service.ts
import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { Ubicacion } from '../types';

class GeoService {
  private baseUrl = API_CONFIG.geo;

  async getAll(): Promise<Ubicacion[]> {
    try {
      const response = await authFetch(this.baseUrl);
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
    const response = await authFetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Ubicación no encontrada');
    return response.json();
  }

  async getByPetId(petId: string): Promise<Ubicacion[]> {
    try {
      console.log(`getByPetId - petId: ${petId}`);
      const response = await authFetch(`${this.baseUrl}/reporte/${petId}`);
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        console.log(`No se encontraron ubicaciones para petId: ${petId}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`Datos recibidos:`, data);
      
      if (data._embedded?.ubicacionList) {
        console.log(`${data._embedded.ubicacionList.length} ubicaciones encontradas (_embedded)`);
        return data._embedded.ubicacionList;
      }
      if (Array.isArray(data)) {
        console.log(`${data.length} ubicaciones encontradas (array)`);
        return data;
      }
      console.log('Formato de respuesta no reconocido');
      return [];
    } catch (error) {
      console.error(`Error fetching locations for pet ${petId}:`, error);
      return [];
    }
  }

  // Método 1: Intentar obtener por endpoint de usuario
  async getUbicacionesByUserId(userId: string): Promise<Ubicacion[]> {
    try {
      console.log('getUbicacionesByUserId - userId:', userId);
      
      // 1. Obtener TODAS las mascotas
      console.log('Obteniendo todas las mascotas...');
      const petsResponse = await authFetch(API_CONFIG.pet);
      console.log(`Response status: ${petsResponse.status}`);
      
      if (!petsResponse.ok) {
        console.error('Error al obtener mascotas:', petsResponse.status);
        return [];
      }
      
      const petsData = await petsResponse.json();
      console.log('petsData recibido:', petsData);
      
      let allPets = [];
      if (petsData._embedded?.mascotaList) {
        allPets = petsData._embedded.mascotaList;
      } else if (Array.isArray(petsData)) {
        allPets = petsData;
      }
      
      console.log(`Total de mascotas: ${allPets.length}`);
      console.log('Detalle de todas las mascotas:', allPets.map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        ownerId: p.ownerId 
      })));
      
      // 2. Filtrar por ownerId
      const userPets = allPets.filter((pet: any) => {
        console.log(`Comparando pet.ownerId: "${pet.ownerId}" con userId: "${userId}"`);
        return pet.ownerId === userId;
      });
      
      console.log(`Mascotas del usuario ${userId}: ${userPets.length}`);
      console.log('Detalle mascotas del usuario:', userPets.map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        ownerId: p.ownerId 
      })));
      
      if (userPets.length === 0) {
        console.log('ℹ️ El usuario no tiene mascotas');
        return [];
      }
      
      // 3. Obtener ubicaciones de cada mascota
      const ubicacionesPromises = userPets.map(async (pet: any) => {
        if (!pet.id) {
          console.log(`Mascota sin ID:`, pet);
          return [];
        }
        console.log(`Buscando ubicaciones para mascota: ${pet.name} (${pet.id})`);
        console.log(`URL: ${this.baseUrl}/reporte/${pet.id}`);
        
        try {
          const ubicaciones = await this.getByPetId(pet.id);
          console.log(`Mascota ${pet.name}: ${ubicaciones.length} ubicaciones encontradas`);
          console.log(`Ubicaciones:`, ubicaciones);
          return ubicaciones;
        } catch (error) {
          console.error(`Error fetching ubicaciones for pet ${pet.id}:`, error);
          return [];
        }
      });
      
      const ubicacionesArrays = await Promise.all(ubicacionesPromises);
      const todasUbicaciones = ubicacionesArrays.flat();
      
      console.log(`Total ubicaciones del usuario: ${todasUbicaciones.length}`);
      console.log('Detalle ubicaciones finales:', todasUbicaciones.map((u: any) => ({ 
        id: u.id, 
        reportId: u.reportId 
      })));
      
      return todasUbicaciones;
    } catch (error) {
      console.error('Error en getUbicacionesByUserId:', error);
      return [];
    }
  }

  // Método 2: Alternativo - Filtrar ubicaciones directamente
  async getUbicacionesByUserIdAlt(userId: string): Promise<Ubicacion[]> {
    try {
      console.log('getUbicacionesByUserIdAlt - userId:', userId);
      
      // 1. Obtener todas las ubicaciones
      console.log('Obteniendo todas las ubicaciones...');
      const todasUbicaciones = await this.getAll();
      console.log(`Total de ubicaciones: ${todasUbicaciones.length}`);
      
      // 2. Obtener todas las mascotas
      console.log('Obteniendo todas las mascotas...');
      const petsResponse = await authFetch(API_CONFIG.pet);
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
      
      console.log(`Total de mascotas: ${allPets.length}`);
      
      // 3. Filtrar mascotas del usuario
      const userPets = allPets.filter((pet: any) => pet.ownerId === userId);
      const userPetIds = userPets.map((pet: any) => pet.id);
      
      console.log(`Mascotas del usuario: ${userPets.length}`);
      console.log(`IDs de mascotas del usuario:`, userPetIds);
      
      // 4. Filtrar ubicaciones por reportId
      const ubicacionesFiltradas = todasUbicaciones.filter(
        (ubicacion: any) => userPetIds.includes(ubicacion.reportId)
      );
      
      console.log(`Ubicaciones filtradas: ${ubicacionesFiltradas.length}`);
      console.log('Detalle:', ubicacionesFiltradas.map((u: any) => ({ 
        id: u.id, 
        reportId: u.reportId 
      })));
      
      return ubicacionesFiltradas;
    } catch (error) {
      console.error('Error en getUbicacionesByUserIdAlt:', error);
      return [];
    }
  }

  async getNearby(lng: number, lat: number, radiusKm: number = 5.0): Promise<Ubicacion[]> {
    try {
      const url = new URL(`${this.baseUrl}/cercanos`);
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

  async create(ubicacion: Ubicacion): Promise<Ubicacion> {
    console.log('Creando ubicación:', ubicacion);
    const response = await authFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ubicacion)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al crear ubicación:', errorText);
      throw new Error('Error al crear ubicación');
    }
    const data = await response.json();
    console.log('Ubicación creada:', data);
    return data;
  }

  async update(id: string, ubicacion: Ubicacion): Promise<Ubicacion> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ubicacion)
    });
    if (!response.ok) throw new Error('Error al actualizar ubicación');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

export default new GeoService();