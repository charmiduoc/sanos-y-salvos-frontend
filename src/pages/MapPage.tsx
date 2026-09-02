// src/pages/MapPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UiMap } from '../components/UiMap';
import { useAuth } from '../context/AuthContext';

export const MapPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const navigate = useNavigate();

  console.log('🗺️ MapPage - currentUserId:', currentUserId);

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mapa de Avistamientos</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                Visualiza todas las mascotas reportadas y sus últimas ubicaciones en el mapa.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white shadow-sm">
              <MapPin className="h-5 w-5" />
              Avistamientos
            </div>
          </div>
        </motion.div>

        <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-md overflow-hidden">
          {}
          <UiMap 
            currentUserId={currentUserId}
            filterByUser={false}  // ← CAMBIADO
          />
        </div>
      </div>
    </div>
  );
};