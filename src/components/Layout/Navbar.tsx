import React, { useState } from 'react';
import { Sun, Moon, Home, Map, GitCompare, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UiNotificationBell } from '../UiNotificationBell';
import type { Usuario } from '../../types';
import logo from '../../assets/logo.png';

interface NavbarProps {
  currentUser: Usuario | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogin, onRegister, onLogout }) => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/map', label: 'Mapa', icon: Map },
    { path: '/matches', label: 'Coincidencias', icon: GitCompare },
    ...(currentUser ? [{ path: '/report', label: 'Nuevo Reporte', icon: AlertTriangle }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 bg-white/[0.97] dark:bg-gray-800/[0.97] shadow-none border-b border-gray-100 dark:border-gray-700">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo - Estilo Dogin */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img 
            src={logo} 
            alt="Sanos y Salvos" 
            width="140" 
            height="71" 
            className="h-20 w-auto object-contain"
          />
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-red-600 ${
                isActive(link.path)
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleDarkMode}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 transition-colors hover:border-red-600 hover:text-red-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-600 dark:hover:text-red-600"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {currentUser ? (
            <>
              <UiNotificationBell userId={currentUser.id!} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">{currentUser.name}</span>
                <button
                  onClick={onLogout}
                  className="rounded-xl border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:border-red-600 hover:text-red-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-600 dark:hover:text-red-600"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={onRegister}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Registrarse
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          aria-label="Abrir menú"
        >
          <div className="flex w-5 flex-col gap-[5px]">
            <span className={`block h-[2px] w-5 rounded-full transition-transform duration-200 bg-gray-700 dark:bg-gray-300 ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
            <span className={`block h-[2px] w-5 rounded-full transition-opacity duration-150 bg-gray-700 dark:bg-gray-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-[2px] w-5 rounded-full transition-transform duration-200 bg-gray-700 dark:bg-gray-300 ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-5 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-red-600 ${
                  isActive(link.path)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t dark:border-gray-700">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{currentUser.name}</span>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-xl border border-red-600 px-4 py-2 text-sm font-medium text-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onLogin();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:border-red-600 hover:text-red-600 dark:border-gray-600"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      onRegister();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};