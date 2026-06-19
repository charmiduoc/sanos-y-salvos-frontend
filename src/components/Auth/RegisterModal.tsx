import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (userData: any) => void;
  isLoading: boolean;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegister, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CITIZEN'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Registrarse</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};