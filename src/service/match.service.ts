import API_CONFIG from './api.config';
import { authFetch } from './auth.service';
import type { MatchRequest, MatchAction, MatchResponse } from '../types';

class MatchService {
  private baseUrl = API_CONFIG.match;

  async create(matchRequest: MatchRequest): Promise<MatchResponse> {
    const response = await authFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchRequest)
    });
    if (!response.ok) throw new Error('Error al crear match');
    return response.json();
  }

  async getById(matchId: string): Promise<MatchResponse> {
    const response = await authFetch(`${this.baseUrl}/${matchId}`);
    if (!response.ok) throw new Error('Match no encontrado');
    return response.json();
  }

  async getByOwnerId(ownerId: string): Promise<MatchResponse[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/owner/${ownerId}`);
      const data = await response.json();
      if (data._embedded?.matchResponseDTOList) return data._embedded.matchResponseDTOList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching owner matches:', error);
      return [];
    }
  }

  async getByFounderId(founderId: string): Promise<MatchResponse[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/founder/${founderId}`);
      const data = await response.json();
      if (data._embedded?.matchResponseDTOList) return data._embedded.matchResponseDTOList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching founder matches:', error);
      return [];
    }
  }

  async getPendingForOwner(ownerId: string): Promise<MatchResponse[]> {
    try {
      const response = await authFetch(`${this.baseUrl}/owner/${ownerId}/pending`);
      const data = await response.json();
      if (data._embedded?.matchResponseDTOList) return data._embedded.matchResponseDTOList;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching pending matches:', error);
      return [];
    }
  }

  async respond(action: MatchAction): Promise<MatchResponse> {
    const response = await authFetch(`${this.baseUrl}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    if (!response.ok) throw new Error('Error al responder match');
    return response.json();
  }

  async complete(matchId: string): Promise<MatchResponse> {
    const response = await authFetch(`${this.baseUrl}/${matchId}/complete`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Error al completar match');
    return response.json();
  }

  async delete(matchId: string): Promise<void> {
    await authFetch(`${this.baseUrl}/${matchId}`, {
      method: 'DELETE'
    });
  }

  async exists(matchId: string): Promise<boolean> {
    const response = await authFetch(`${this.baseUrl}/${matchId}/exists`);
    return response.json();
  }
}

export default new MatchService();