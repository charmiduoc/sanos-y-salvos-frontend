import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../service/auth.service';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'CITIZEN';
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const user = getStoredUser();

  // 1. Verificar autenticación
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 2. Verificar rol requerido
  if (requiredRole) {
    const userRole = user.role?.replace('ROLE_', '');
    if (userRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Verificar expiración del token (si existe la propiedad)
  if (user.expiration && new Date(user.expiration) < new Date()) {
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};