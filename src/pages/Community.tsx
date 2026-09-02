// src/pages/Community.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PawPrint, MapPin, Calendar, Search, Filter, 
  Loader2, Eye, MessageSquare, Image as ImageIcon,
  ChevronLeft, ChevronRight, X, AlertCircle,
  User, Clock, Navigation, Phone, Mail, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import petService from '../service/pet.service';
import imageService from '../service/image.service';
import userService from '../service/user.service';
import { useAuth } from '../context/AuthContext';
import type { Mascota, Usuario } from '../types';

export const Community: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pets, setPets] = useState<Mascota[]>([]);
  const [users, setUsers] = useState<Record<string, Usuario>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [petsData, usersData] = await Promise.all([
        petService.getAll(),
        userService.getAll()
      ]);
      
      setPets(petsData);
      
      const userMap: Record<string, Usuario> = {};
      
      // Primero agregar el usuario actual si existe
      if (currentUser) {
        userMap[currentUser.id] = currentUser;
      }
      
      // Luego agregar todos los usuarios de la lista
      usersData.forEach((u: Usuario) => {
        userMap[u.id] = u;
      });
      
      setUsers(userMap);
      
      console.log('Reportes cargados:', petsData.length);
      console.log('Usuarios mapeados:', Object.keys(userMap).length);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || pet.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const paginatedPets = filteredPets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusLabels: Record<string, string> = {
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    REUNITED: 'Reunido'
  };

  const statusBadgeColors: Record<string, string> = {
    LOST: 'bg-red-500',
    FOUND: 'bg-green-500',
    REUNITED: 'bg-purple-500'
  };

  const getOwnerName = (ownerId: string) => {
    const owner = users[ownerId];
    if (owner) return owner.name;
    // Si no está en el mapa, intentar buscar en currentUser
    if (currentUser && currentUser.id === ownerId) return currentUser.name;
    return 'Usuario desconocido';
  };

  const getOwnerPhone = (ownerId: string) => {
    const owner = users[ownerId];
    if (owner) return owner.phone || 'No disponible';
    if (currentUser && currentUser.id === ownerId) return currentUser.phone || 'No disponible';
    return 'No disponible';
  };

  const getOwnerEmail = (ownerId: string) => {
    const owner = users[ownerId];
    if (owner) return owner.email || 'No disponible';
    if (currentUser && currentUser.id === ownerId) return currentUser.email || 'No disponible';
    return 'No disponible';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PawPrint className="h-8 w-8 text-blue-500" />
            Comunidad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explora los reportes de mascotas perdidas y encontradas de la comunidad
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, especie, raza o descripcion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="LOST">Perdidos</option>
                <option value="FOUND">Encontrados</option>
                <option value="REUNITED">Reunidos</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginatedPets.length} de {filteredPets.length} reportes
          </p>
        </div>

        {filteredPets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron reportes</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Prueba con otros filtros o regresa mas tarde
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPets.map((pet, index) => {
                const ownerName = getOwnerName(pet.ownerId);
                return (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedPet(pet)}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col h-full"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {pet.imageId ? (
                        <img
                          src={imageService.getImageUrl(pet.imageId)}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${statusBadgeColors[pet.status]}`}>
                          {statusLabels[pet.status]}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{pet.name}</h3>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <PawPrint className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span>{pet.species}</span>
                        {pet.breed && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="truncate">{pet.breed}</span>
                          </>
                        )}
                        {pet.color && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span>{pet.color}</span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                        {pet.description || 'Sin descripcion'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">{ownerName}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(pet.reportedAt)}</span>
                        </div>
                      </div>

                      {pet.lastLocation?.address && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                          <span className="truncate">{pet.lastLocation.address}</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPet(pet);
                        }}
                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${statusBadgeColors[selectedPet.status]}`}>
                  {statusLabels[selectedPet.status]}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPet.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPet(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 h-64 md:h-80">
                    {selectedPet.imageId ? (
                      <img
                        src={imageService.getImageUrl(selectedPet.imageId)}
                        alt={selectedPet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <PawPrint className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">Especie:</span>
                      <span>{selectedPet.species}</span>
                      {selectedPet.breed && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <span className="font-medium">Raza:</span>
                          <span>{selectedPet.breed}</span>
                        </>
                      )}
                    </div>
                    {selectedPet.color && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Color:</span>
                        <span>{selectedPet.color}</span>
                      </div>
                    )}
                    {selectedPet.size && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Tamaño:</span>
                        <span>{selectedPet.size}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripcion</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {selectedPet.description || 'Sin descripcion'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Informacion del dueño
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Nombre:</span> {getOwnerName(selectedPet.ownerId)}</p>
                      <p><span className="font-medium">Teléfono:</span> {getOwnerPhone(selectedPet.ownerId)}</p>
                      <p><span className="font-medium">Email:</span> {getOwnerEmail(selectedPet.ownerId)}</p>
                    </div>
                  </div>

                  {selectedPet.lastLocation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        Ubicacion del reporte
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {selectedPet.lastLocation.address || `${selectedPet.lastLocation.latitude}, ${selectedPet.lastLocation.longitude}`}
                      </p>
                      
                      <div className="rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 h-48">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPet.lastLocation.longitude - 0.01},${selectedPet.lastLocation.latitude - 0.01},${selectedPet.lastLocation.longitude + 0.01},${selectedPet.lastLocation.latitude + 0.01}&layer=mapnik&marker=${selectedPet.lastLocation.latitude},${selectedPet.lastLocation.longitude}`}
                          allowFullScreen
                          title="Mapa de ubicación"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>
                          Lat: {selectedPet.lastLocation.latitude.toFixed(6)}, 
                          Lng: {selectedPet.lastLocation.longitude.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Reportado: {formatDate(selectedPet.reportedAt)}</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedPet(null);
                        navigate(`/pet/${selectedPet.id}`);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver reporte completo
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPet(null);
                        const phone = getOwnerPhone(selectedPet.ownerId);
                        if (phone && phone !== 'No disponible') {
                          window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
                        } else {
                          toast('No hay número de teléfono disponible', {
                            duration: 3000
                          });
                        }
                      }}
                      className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contactar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};