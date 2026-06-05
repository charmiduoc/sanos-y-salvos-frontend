import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Dashboard } from './pages/Dashboard';
import { Navbar } from './components/Layout/Navbar';
import userService from './service/user.service';
import { getStoredUser, setStoredUser, clearStoredUser } from './service/auth.service';
import type { Usuario } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (showLogin || showRegister) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [showLogin, showRegister]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await userService.login({ email: loginEmail, password: loginPassword });
      setCurrentUser(user);
      setStoredUser(user);
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      toast.success(`¡Bienvenido ${user.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciales inválidas';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      await userService.register(userData);
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
      setShowRegister(false);
    } catch (error) {
      toast.error('Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearStoredUser();
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <Navbar 
        currentUser={currentUser}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onLogout={handleLogout}
      />

      <Dashboard currentUserId={currentUser?.id} />

      {/* Login Modal */}
      {showLogin && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={() => setShowLogin(false)}
          />
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Iniciar Sesión</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="w-full mt-2 text-gray-500 p-2 hover:text-gray-700 transition dark:text-gray-400"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Register Modal */}
      {showRegister && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={() => setShowRegister(false)}
          />
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Registrarse</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleRegister({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  phone: formData.get('phone'),
                  role: 'CITIZEN'
                });
              }}>
                <input
                  name="name"
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  className="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                  required
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="w-full mt-2 text-gray-500 p-2 hover:text-gray-700 transition dark:text-gray-400"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;