// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PawPrint, MapPin, Heart, AlertTriangle, Search, Calendar, Award } from 'lucide-react';
import { UiReportCard } from '../components/UiReportCard';
import { UiMap } from '../components/UiMap';
import petService from '../service/pet.service';
import userService from '../service/user.service';
import type { Mascota } from '../types';

interface DashboardProps {
  currentUserId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUserId }) => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'LOST' | 'FOUND' | 'REUNITED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      console.log('Dashboard - currentUserId:', currentUserId);
      
      let pets: Mascota[] = [];
      
      if (currentUserId) {
        console.log('Cargando mascotas del usuario:', currentUserId);
        const userPets = await userService.getMyPets(currentUserId);
        console.log('Mascotas del usuario encontradas:', userPets.length);
        pets = userPets;
      } else {
        console.log('Cargando todas las mascotas');
        const allPets = await petService.getAll();
        console.log('Todas las mascotas encontradas:', allPets.length);
        pets = allPets;
      }
      
      setMascotas(pets);
    } catch (error) {
      console.error('Error loading pets:', error);
      toast.error('Error al cargar las mascotas');
      setMascotas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar un reporte
  const handleDeleteReport = async (petId: string) => {
    try {
      // Eliminar de la API
      await petService.delete(petId);
      
      // Actualizar el estado local
      setMascotas(prev => prev.filter(pet => pet.id !== petId));
      
      toast.success('Reporte eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  const stats = {
    total: mascotas.length,
    lost: mascotas.filter(p => p.status === 'LOST').length,
    found: mascotas.filter(p => p.status === 'FOUND').length,
    reunited: mascotas.filter(p => p.status === 'REUNITED').length,
  };

  const filteredMascotas = mascotas
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleViewLocation = (petId: string) => {
    const pet = mascotas.find(p => p.id === petId);
    if (pet?.lastLocation) {
      const { latitude, longitude } = pet.lastLocation;
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
      toast.success('Abriendo ubicación en Google Maps');
    } else {
      toast.error('No hay ubicación disponible para esta mascota');
    }
  };

  const handleViewDetails = (petId: string) => {
    navigate(`/pet/${petId}`);
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentUserId ? `Tus mascotas reportadas (${mascotas.length})` : 'Bienvenido al sistema de gestión de mascotas'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Reportes" 
            value={stats.total} 
            icon={PawPrint} 
            color="blue"
          />
          <StatCard 
            title="Perdidas" 
            value={stats.lost} 
            icon={AlertTriangle} 
            color="red"
          />
          <StatCard 
            title="Encontradas" 
            value={stats.found} 
            icon={MapPin} 
            color="green"
          />
          <StatCard 
            title="Reunidas" 
            value={stats.reunited} 
            icon={Heart} 
            color="purple"
          />
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'LOST', 'FOUND', 'REUNITED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status === 'LOST' ? 'Perdidos' : status === 'FOUND' ? 'Encontrados' : 'Reunidos'}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mascota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 w-full sm:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - List and Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pets Grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentUserId ? 'Mis Mascotas Reportadas' : 'Mascotas Reportadas'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredMascotas.length} {
                      filter === 'all'
                        ? filteredMascotas.length === 1
                          ? 'reporte encontrado'
                          : 'reportes encontrados'
                        : filter === 'LOST'
                          ? filteredMascotas.length === 1
                            ? 'mascota perdida'
                            : 'mascotas perdidas'
                          : filter === 'FOUND'
                            ? filteredMascotas.length === 1
                              ? 'mascota encontrada'
                              : 'mascotas encontradas'
                            : filteredMascotas.length === 1
                              ? 'mascota reunida'
                              : 'mascotas reunidas'
                    }
                  </p>
                </div>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-4 flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMascotas.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {currentUserId 
                      ? 'No has reportado ninguna mascota aún. ¡Crea tu primer reporte!' 
                      : 'No hay mascotas que coincidan con los filtros'}
                  </p>
                  {currentUserId && (
                    <Link
                      to="/report"
                      className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reportar una mascota
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSearchTerm('');
                    }}
                    className="mt-4 text-red-600 hover:text-red-700 text-sm block w-full"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredMascotas.slice(0, 6).map((mascota, index) => (
                      <motion.div
                        key={mascota.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <UiReportCard 
                          report={mascota} 
                          onViewLocation={handleViewLocation}
                          onViewDetails={handleViewDetails}
                          onDelete={handleDeleteReport}
                          currentUserId={currentUserId}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Map Section - ACTUALIZADO */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentUserId ? 'Mapa de tus avistamientos' : 'Mapa de Avistamientos'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Actualizado en tiempo real</span>
                  </div>
                </div>
              </div>
              <UiMap 
                currentUserId={currentUserId}
                filterByUser={!!currentUserId}
              />
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-[88px] space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reportar una mascota</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Los reportes ahora se crean en su propia página para una experiencia más clara y ordenada.
                </p>
                {currentUserId ? (
                  <Link
                    to="/report"
                    className="inline-flex mt-4 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Crear nuevo reporte
                  </Link>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Inicia sesión para ver la opción de crear un reporte.
                  </p>
                )}
              </div>

              {/* Tips Card */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Consejos útiles</h3>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Sube una foto clara de tu mascota</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Indica la última ubicación exacta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Comparte el reporte en redes sociales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Mantén actualizado el estado de tu mascota</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};