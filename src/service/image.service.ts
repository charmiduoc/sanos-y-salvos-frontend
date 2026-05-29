import API_CONFIG from './api.config';
import type { ImageResponse } from '../types';

class ImageService {
  private baseUrl = API_CONFIG.image;

  async upload(imageId: string, file: File): Promise<ImageResponse> {
    const formData = new FormData();
    formData.append('imageId', imageId);
    formData.append('file', file);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Error al subir imagen');
    return response.json();
  }

  async getMetadata(imageId: string): Promise<ImageResponse> {
    const response = await fetch(`${this.baseUrl}/${imageId}`);
    if (!response.ok) throw new Error('Imagen no encontrada');
    return response.json();
  }

  async download(imageId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/download/${imageId}`);
    if (!response.ok) throw new Error('Error al descargar imagen');
    return response.blob();
  }

  getImageUrl(imageId: string): string {
    return `${this.baseUrl}/download/${imageId}`;
  }

  async exists(imageId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${imageId}/exists`);
    return response.json();
  }

  async delete(imageId: string): Promise<void> {
    await fetch(`${this.baseUrl}/${imageId}`, {
      method: 'DELETE'
    });
  }
}

export default new ImageService();