// src/pages/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Shield, Trash2, Edit, Search, Loader2, 
  ArrowLeft, PawPrint, Eye, Save, X, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import userService from '../service/user.service';
import petService from '../service/pet.service';
import { AdminRegisterModal } from '../components/Auth/AdminRegisterModal';
import { useAuth } from '../context/AuthContext';
import type { Usuario, RegisterRequest, Mascota, ActualizarMascota } from '../types';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [pets, setPets] = useState<Mascota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPetTerm, setSearchPetTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingPet, setIsDeletingPet] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editingPet, setEditingPet] = useState<Mascota | null>(null);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'mascotas'>('usuarios');

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      loadUsers();
      loadPets();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPets = async () => {
    try {
      setIsLoadingPets(true);
      const data = await petService.getAll();
      setPets(data);
    } catch (error) {
      console.error('Error loading pets:', error);
      toast.error('Error al cargar las mascotas');
    } finally {
      setIsLoadingPets(false);
    }
  };

  const handleRegister = async (userData: RegisterRequest) => {
    try {
      await userService.register(userData);
      toast.success('Usuario registrado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar usuario');
      throw error;
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Estas seguro de eliminar este usuario?')) return;
    
    try {
      setIsDeleting(userId);
      await userService.delete(userId);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Estas seguro de eliminar esta mascota?')) return;
    
    try {
      setIsDeletingPet(petId);
      await petService.delete(petId);
      toast.success('Mascota eliminada exitosamente');
      loadPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error('Error al eliminar mascota');
    } finally {
      setIsDeletingPet(null);
    }
  };

  const handleUpdateUser = async (userData: Partial<Usuario>) => {
    if (!editingUser) return;
    
    try {
      await userService.update(editingUser.id, userData);
      toast.success('Usuario actualizado exitosamente');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Error al actualizar usuario');
    }
  };

  const handleUpdatePet = async (petData: Partial<Mascota>) => {
    if (!editingPet) return;
    
    try {
      // Crear el objeto con el formato que espera ActualizarMascota
      const updateData: ActualizarMascota = {
        id: editingPet.id,
        ...petData
      };
      await petService.update(editingPet.id, updateData);
      toast.success('Mascota actualizada exitosamente');
      setEditingPet(null);
      loadPets();
    } catch (error: any) {
      console.error('Error updating pet:', error);
      toast.error(error.message || 'Error al actualizar mascota');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.update(userId, { active: !currentStatus });
      toast.success('Usuario ' + (!currentStatus ? 'activado' : 'desactivado') + ' exitosamente');
      loadUsers();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const filteredUsers = users.filter(function(user) {
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPets = pets.filter(function(pet) {
    return pet.name?.toLowerCase().includes(searchPetTerm.toLowerCase()) ||
      pet.species?.toLowerCase().includes(searchPetTerm.toLowerCase()) ||
      pet.ownerId?.toLowerCase().includes(searchPetTerm.toLowerCase());
  });

  const statusLabels: Record<string, string> = {
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    REUNITED: 'Reunido'
  };

  const statusColors: Record<string, string> = {
    LOST: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    FOUND: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REUNITED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  };

  if (!user) {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Debes iniciar sesion para acceder al panel de administracion.
          </p>
          <button
            onClick={function() { navigate('/login'); }}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Ir a Iniciar Sesion
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'ROLE_ADMIN') {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No autorizado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder al panel de administracion.
          </p>
          <button
            onClick={function() { navigate('/dashboard'); }}
            className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={function() { navigate('/dashboard'); }}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Panel de Administracion
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona usuarios y mascotas del sistema
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={function() { setShowRegisterModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Registrar Usuario
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Administradores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(function(u) { return u.role === 'ROLE_ADMIN'; }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(function(u) { return u.active; }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <PawPrint className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Mascotas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pets.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={function() { setActiveTab('usuarios'); }}
            className={'px-4 py-2 font-medium transition-colors ' + (
              activeTab === 'usuarios'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Usuarios
          </button>
          <button
            onClick={function() { setActiveTab('mascotas'); }}
            className={'px-4 py-2 font-medium transition-colors ' + (
              activeTab === 'mascotas'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <PawPrint className="inline h-4 w-4 mr-2" />
            Mascotas
          </button>
        </div>

        {activeTab === 'usuarios' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  value={searchTerm}
                  onChange={function(e) { setSearchTerm(e.target.value); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Telefono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map(function(user) {
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                  {user.name?.charAt(0) || '?'}
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {user.phone || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={'px-2 py-1 text-xs font-medium rounded-full ' + (
                                user.role === 'ROLE_ADMIN'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              )}>
                                {user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Ciudadano'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={function() { handleToggleStatus(user.id, user.active); }}
                                className={'px-2 py-1 text-xs font-medium rounded-full transition-colors ' + (
                                  user.active
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                )}
                              >
                                {user.active ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={function() { setEditingUser(user); }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={function() { handleDelete(user.id); }}
                                  disabled={isDeleting === user.id}
                                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {isDeleting === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'mascotas' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mascota por nombre, especie o dueno..."
                  value={searchPetTerm}
                  onChange={function(e) { setSearchPetTerm(e.target.value); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {isLoadingPets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredPets.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No se encontraron mascotas
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Mascota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Especie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Dueno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reportado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPets.map(function(pet) {
                        const owner = users.find(function(u) { return u.id === pet.ownerId; });
                        return (
                          <motion.tr
                            key={pet.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {pet.imageId ? (
                                  <img 
                                    src={import.meta.env.VITE_API_IMAGE + '/api/images/download/' + pet.imageId}
                                    alt={pet.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                    onError={function(e) {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                <span className={"ml-3 text-sm font-medium text-gray-900 dark:text-white " + (pet.imageId ? '' : '')}>
                                  {pet.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {pet.species}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {owner?.name || 'Desconocido'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={'px-2 py-1 text-xs font-medium rounded-full ' + (
                                statusColors[pet.status] || 'bg-gray-100 text-gray-700'
                              )}>
                                {statusLabels[pet.status] || pet.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {pet.reportedAt ? new Date(pet.reportedAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={function() { setEditingPet(pet); }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={function() { navigate('/pet/' + pet.id); }}
                                  className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={function() { handleDeletePet(pet.id); }}
                                  disabled={isDeletingPet === pet.id}
                                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {isDeletingPet === pet.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Editar Usuario Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Usuario
              </h3>
              <button
                onClick={function() { setEditingUser(null); }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={function(e) {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const updateData: any = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                role: formData.get('role') as 'ROLE_USER' | 'ROLE_ADMIN',
              };
              
              const password = formData.get('password') as string;
              if (password && password.trim() !== '') {
                updateData.password = password;
              }
              
              handleUpdateUser(updateData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    name="name"
                    defaultValue={editingUser.name}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingUser.email}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefono
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingUser.phone || ''}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ROLE_USER">Ciudadano</option>
                    <option value="ROLE_ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contrasena (dejar vacio para no cambiar)
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Nueva contrasena"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={function() { setEditingUser(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editar Mascota Modal */}
      {editingPet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Mascota
              </h3>
              <button
                onClick={function() { setEditingPet(null); }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={function(e) {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const updateData: any = {
                name: formData.get('name') as string,
                species: formData.get('species') as string,
                breed: formData.get('breed') as string,
                color: formData.get('color') as string,
                size: formData.get('size') as string,
                description: formData.get('description') as string,
                status: formData.get('status') as 'LOST' | 'FOUND' | 'REUNITED',
              };
              
              handleUpdatePet(updateData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    name="name"
                    defaultValue={editingPet.name}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Especie
                  </label>
                  <select
                    name="species"
                    defaultValue={editingPet.species}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Raza
                  </label>
                  <input
                    name="breed"
                    defaultValue={editingPet.breed || ''}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    name="color"
                    defaultValue={editingPet.color || ''}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tamaño
                  </label>
                  <select
                    name="size"
                    defaultValue={editingPet.size || 'Mediano'}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    defaultValue={editingPet.status}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOST">Perdido</option>
                    <option value="FOUND">Encontrado</option>
                    <option value="REUNITED">Reunido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingPet.description || ''}
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={function() { setEditingPet(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <AdminRegisterModal
          onClose={function() { setShowRegisterModal(false); }}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};