// src/pages/PetDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Heart,
  PawPrint,
  Clock,
  Share2,
  MessageCircle,
  Eye,
  Award
} from 'lucide-react';
import petService from '../service/pet.service';
import imageService from '../service/image.service';
import type { Mascota } from '../types';

export const PetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Mascota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadPet(id);
    }
  }, [id]);

  const loadPet = async (petId: string) => {
    try {
      setIsLoading(true);
      const data = await petService.getById(petId);
      setPet(data);
      
      if (data.imageId) {
        setIsImageLoading(true);
        try {
          const url = imageService.getImageUrl(data.imageId);
          setImageUrl(url);
        } catch (error) {
          console.error('Error loading image:', error);
        } finally {
          setIsImageLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading pet:', error);
      toast.error('Error al cargar los detalles de la mascota');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    LOST: 'bg-red-600 text-white',
    FOUND: 'bg-green-600 text-white',
    REUNITED: 'bg-purple-600 text-white'
  };

  const statusLabels: Record<string, string> = {
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    REUNITED: 'Reunido'
  };

  const statusIcons: Record<string, any> = {
    LOST: AlertTriangle,
    FOUND: MapPin,
    REUNITED: Heart
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mascota ${pet?.status === 'LOST' ? 'perdida' : 'encontrada'}: ${pet?.name}`,
        text: `Ayuda a encontrar a ${pet?.name}! ${pet?.description}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleViewOnMap = () => {
    if (pet?.lastLocation) {
      const { latitude, longitude } = pet.lastLocation;
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
      toast.success('Abriendo ubicación en Google Maps');
    } else {
      toast.error('No hay ubicación disponible para esta mascota');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mascota no encontrada</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La mascota que buscas no existe o ha sido eliminada.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[pet.status] || PawPrint;

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón volver */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Volver al dashboard
          </button>

          {/* Tarjeta principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header con estado - Rojo sólido */}
            <div className={`px-5 py-3 ${statusColors[pet.status] || 'bg-red-600'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5 text-white" />
                  <h1 className="text-xl font-bold text-white">
                    {pet.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                    {statusLabels[pet.status] || pet.status}
                  </span>
                  {pet.reportedAt && (
                    <span className="text-xs text-white/80 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(pet.reportedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Columna izquierda - Imagen */}
                <div>
                  <div className="relative">
                    {isImageLoading ? (
                      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                        <PawPrint className="h-12 w-12 text-gray-400" />
                      </div>
                    ) : imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={pet.name} 
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                        <PawPrint className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Sin imagen disponible</p>
                      </div>
                    )}
                    
                    {/* Badge de estado en la imagen */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[pet.status]} shadow-lg`}>
                        {statusLabels[pet.status] || pet.status}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción en móvil */}
                  <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
                    <button
                      onClick={handleViewOnMap}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <MapPin size={16} />
                      Ubicación
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Share2 size={16} />
                      Compartir
                    </button>
                  </div>
                </div>

                {/* Columna derecha - Información */}
                <div className="space-y-4">
                  {/* Descripción */}
                  {pet.description && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Descripción
                      </h3>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {pet.description}
                      </p>
                    </div>
                  )}

                  {/* Características */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Características
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Especie</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{pet.species}</p>
                      </div>
                      {pet.breed && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Raza</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{pet.breed}</p>
                        </div>
                      )}
                      {pet.color && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{pet.color}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ubicación */}
                  {pet.lastLocation && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Ubicación
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {pet.lastLocation.address || `${pet.lastLocation.latitude}, ${pet.lastLocation.longitude}`}
                            </p>
                            <button
                              onClick={handleViewOnMap}
                              className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Ver en Google Maps
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fecha de reporte */}
                  {pet.reportedAt && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Fecha de reporte
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(pet.reportedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones - Desktop */}
              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleViewOnMap}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    <MapPin size={18} />
                    Ver en Google Maps
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
                  >
                    <Share2 size={18} />
                    Compartir reporte
                  </button>
                  <button
                    onClick={() => {
                      const message = `¡Ayuda a encontrar a ${pet.name}! ${pet.description}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Consejos adicionales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg"
          >
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base mb-1.5">¿Cómo puedes ayudar?</h3>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Comparte esta publicación en tus redes sociales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Si ves a esta mascota, contacta al reportante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Mantente atento a actualizaciones del estado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Difunde el mensaje en tu comunidad</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};