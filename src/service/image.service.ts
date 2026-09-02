// src/service/image.service.ts
import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { ImageResponse } from '../types';

class ImageService {
  private baseUrl = API_CONFIG.image;

  async upload(imageId: string, file: File): Promise<ImageResponse> {
    console.log('📤 Iniciando upload de imagen:', { 
      imageId, 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type,
      url: `${this.baseUrl}/api/images`
    });
    
    const formData = new FormData();
    formData.append('imageId', imageId);
    formData.append('file', file);

    // Verificar FormData
    console.log('📦 FormData contenido:');
    for (let pair of formData.entries()) {
      console.log('  -', pair[0], ':', pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
    }

    try {
      const response = await authFetch(`${this.baseUrl}/api/images`, {
        method: 'POST',
        body: formData
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`Error al subir imagen: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Imagen subida exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en upload:', error);
      throw error;
    }
  }

  async getMetadata(imageId: string): Promise<ImageResponse> {
    console.log('🔍 Obteniendo metadata:', imageId);
    const response = await authFetch(`${this.baseUrl}/api/images/${imageId}`);
    if (!response.ok) throw new Error('Imagen no encontrada');
    return response.json();
  }

  async download(imageId: string): Promise<Blob> {
    console.log('📥 Descargando imagen:', imageId);
    const response = await authFetch(`${this.baseUrl}/api/images/download/${imageId}`);
    if (!response.ok) throw new Error('Error al descargar imagen');
    return response.blob();
  }

  getImageUrl(imageId: string): string {
    return `${this.baseUrl}/api/images/download/${imageId}`;
  }

  async exists(imageId: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando existencia:', imageId);
      const response = await authFetch(`${this.baseUrl}/api/images/${imageId}/exists`);
      if (!response.ok) return false;
      const data = await response.json();
      return data === true || data === 'true';
    } catch {
      return false;
    }
  }

  async delete(imageId: string): Promise<void> {
    console.log('🗑️ Eliminando imagen:', imageId);
    const response = await authFetch(`${this.baseUrl}/api/images/${imageId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar imagen');
  }
}

export default new ImageService();