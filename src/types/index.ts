export interface Usuario {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  active: boolean;
  petsIds: string[];
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiration?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'CITIZEN' | 'ADMIN';
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface Ubicacion {
  id: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  descripcion?: string;
  reportId?: string;
  createdAt?: string;
  updatedAt?: string;
  // ✅ AGREGADO
  posicion?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface LocationWithPet extends Ubicacion {
  petName?: string;
  petStatus?: string;
  ownerId?: string;
  fechaRegistro?: string;
}

export interface Mascota {
  id: string;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  description?: string;
  imageId?: string;
  ownerId: string;
  status: 'LOST' | 'FOUND' | 'REUNITED';
  reportedAt?: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  description?: string;
  imageId?: string;
  status?: 'LOST' | 'FOUND' | 'REUNITED';
  lastLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface Match {
  id: string;
  petId: string;
  userId: string;
  petName?: string;
  userName?: string;
  status: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchRequest {
  petId: string;
  userId: string;
}

export interface MatchResponse {
  id: string;
  petId: string;
  userId: string;
  ownerId: string;
  founderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  similarityScore: number;
  matchReason?: string;
  matchedAt: string;
  respondedAt?: string;
}

export interface MatchAction {
  matchId: string;
  action: 'ACEPTAR' | 'RECHAZAR';
}

export interface Notificacion {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  isRead?: boolean;
  type: 'INFO' | 'MATCH' | 'ALERTA' | 'NEARBY' | 'SYSTEM';
  createdAt?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  petId?: string;
  userId: string;
  location?: Ubicacion;
  images?: string[];
  status: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';
  createdAt?: string;
  updatedAt?: string;
}

export interface Image {
  id: string;
  url: string;
  fileName: string;
  fileSize?: number;
  uploadDate?: string;
  petId?: string;
  userId?: string;
}

export interface ImageResponse {
  id: string;
  url: string;
  fileName: string;
  fileSize?: number;
  uploadDate?: string;
  petId?: string;
  userId?: string;
  imageId?: string;
  message?: string;
  success?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: string;
}

export interface RegisterModalProps {
  onClose: () => void;
  onRegister: (userData: RegisterRequest) => void;
  isLoading: boolean;
}

export interface AdminRegisterModalProps {
  onClose: () => void;
  onRegister: (userData: RegisterRequest) => Promise<void>;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'CITIZEN';
  redirectTo?: string;
}