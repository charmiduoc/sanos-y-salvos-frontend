// ==================== USUARIO ====================
export interface Usuario {
  id?: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: string;
  petsIds: string[];
  active: boolean;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

// ==================== MASCOTA ====================
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Mascota {
  id?: string;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  status: 'LOST' | 'FOUND' | 'REUNITED';
  imageId?: string;
  ownerId?: string;
  founderId?: string;
  description?: string;
  reportedAt?: string;
  foundAt?: string;
  reunitedAt?: string;
  lastLocation?: Location;
}

// ==================== GEOLOCALIZACIÓN ====================
export interface Ubicacion {
  id?: string;
  reportId: string;
  descripcion?: string;
  fechaRegistro: string;
  posicion: {
    type: 'Point';
    coordinates: [number, number]; // [longitud, latitud]
  };
}

// ==================== IMAGEN ====================
export interface ImageResponse {
  imageId: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadDate: string;
}

// ==================== MATCH ====================
export interface MatchRequest {
  lostPetId: string;
  foundPetId: string;
  ownerId: string;
  founderId: string;
}

export interface MatchAction {
  matchId: string;
  action: 'ACCEPT' | 'REJECT';
  message?: string;
}

export interface MatchResponse {
  id: string;
  lostPetId: string;
  foundPetId: string;
  ownerId: string;
  founderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  similarityScore: number;
  matchReason: string;
  matchedAt: string;
  respondedAt?: string;
  ownerResponse?: string;
  founderResponse?: string;
  active: boolean;
}

// ==================== NOTIFICACIÓN ====================
export interface Notificacion {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'MATCH' | 'SYSTEM' | 'NEARBY';
  relatedEntityId: string;
  isRead: boolean;
  createdAt: string;
}