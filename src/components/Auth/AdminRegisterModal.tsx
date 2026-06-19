import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminRegisterModalProps {
  onClose: () => void;
  onRegister: (userData: any) => Promise<void>;
}

export const AdminRegisterModal: React.FC<AdminRegisterModalProps> = ({ onClose, onRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CITIZEN'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(formData);
      toast.success(`Usuario registrado exitosamente como ${formData.role === 'ADMIN' ? 'Administrador' : 'Ciudadano'}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Registrar Nuevo Usuario</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 dark:text-white" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
              minLength={6}
            />
          </div>
          
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full pl-10 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="CITIZEN">Ciudadano (ROLE_USER)</option>
              <option value="ADMIN">Administrador (ROLE_ADMIN)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors mt-4"
          >
            {isLoading ? 'Registrando...' : 'Registrar Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
};