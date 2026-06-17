import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, User, PawPrint, AlertTriangle, CheckCircle2, Square } from 'lucide-react';
import userService from '../service/user.service';
import petService from '../service/pet.service';
import type { Usuario, Mascota } from '../types';
import { AdminRegisterModal } from '../components/Auth/AdminRegisterModal';

interface AdminPanelProps {
  currentUser: Usuario | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [pets, setPets] = useState<Mascota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, petsResponse] = await Promise.all([
        userService.getAll(), 
        petService.getAll()
      ]);
      setUsers(usersResponse);
      setPets(petsResponse);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('No se pudo cargar la información del panel admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, refreshFlag]);

  const handleToggleActive = async (user: Usuario) => {
    try {
      const updatedUser = await userService.update(user.id!, { ...user, active: !user.active });
      toast.success(`Usuario ${updatedUser.name} ${updatedUser.active ? 'activado' : 'desactivado'}.`);
      setRefreshFlag((value) => value + 1);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('No se pudo cambiar el estado del usuario.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.delete(userId);
      toast.success('Usuario eliminado correctamente.');
      setRefreshFlag((value) => value + 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('No se pudo eliminar el usuario.');
    }
  };

  const handleUpdatePetStatus = async (pet: Mascota, nuevoEstado: 'FOUND' | 'REUNITED') => {
    try {
      await petService.updateStatus(pet.id!, nuevoEstado, currentUser?.id);
      toast.success(`Estado de ${pet.name} actualizado a ${nuevoEstado === 'FOUND' ? 'Encontrado' : 'Reunido'}.`);
      setRefreshFlag((value) => value + 1);
    } catch (error) {
      console.error('Error updating pet status:', error);
      toast.error('No se pudo actualizar el estado de la mascota.');
    }
  };

  const handleDeletePet = async (petId: string) => {
    try {
      await petService.delete(petId);
      toast.success('Mascota eliminada correctamente.');
      setRefreshFlag((value) => value + 1);
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error('No se pudo eliminar la mascota.');
    }
  };

  const handleRegisterUser = async (userData: any) => {
    try {
      await userService.register(userData);
      setRefreshFlag((value) => value + 1);
    } catch (error) {
      throw error;
    }
  };

  // Estadísticas corregidas para usar ROLE_ADMIN y ROLE_USER
  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter((user) => user.role === 'ROLE_ADMIN').length,
    citizenUsers: users.filter((user) => user.role === 'ROLE_USER').length,
    totalPets: pets.length,
    lostPets: pets.filter((pet) => pet.status === 'LOST').length,
    foundPets: pets.filter((pet) => pet.status === 'FOUND').length,
    reunitedPets: pets.filter((pet) => pet.status === 'REUNITED').length,
  };

  // Función para mostrar el rol legible
  const getRoleDisplay = (role: string) => {
    if (role === 'ROLE_ADMIN') return 'Administrador';
    if (role === 'ROLE_USER') return 'Ciudadano';
    return role;
  };

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                Gestiona usuarios y reportes desde una sola vista. Solo los administradores pueden ver esta sección.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
              Admin
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-8">
          <StatCard title="Usuarios" value={stats.totalUsers} icon={User} color="blue" />
          <StatCard title="Admins" value={stats.adminUsers} icon={ShieldCheck} color="red" />
          <StatCard title="Ciudadanos" value={stats.citizenUsers} icon={User} color="yellow" />
          <StatCard title="Reportes" value={stats.totalPets} icon={PawPrint} color="red" />
          <StatCard title="Perdidos" value={stats.lostPets} icon={AlertTriangle} color="yellow" />
          <StatCard title="Encontrados" value={stats.foundPets} icon={CheckCircle2} color="green" />
          <StatCard title="Reunidos" value={stats.reunitedPets} icon={Square} color="purple" />
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white dark:bg-gray-800 p-8 shadow-md text-center text-gray-500 dark:text-gray-400">
            Cargando datos del panel admin...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usuarios registrados</h2>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Nuevo Usuario
                </button>
              </div>
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No hay usuarios disponibles.</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Rol: {getRoleDisplay(user.role)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estado: {user.active ? 'Activo' : 'Desactivado'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={!user.id || user.id === currentUser?.id}
                              onClick={() => handleToggleActive(user)}
                              className="rounded-xl border border-red-600 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {user.active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              disabled={!user.id || user.id === currentUser?.id}
                              onClick={() => user.id && handleDeleteUser(user.id)}
                              className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reportes</h2>
              <div className="space-y-3">
                {pets.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No hay reportes disponibles.</p>
                ) : (
                  <div className="space-y-3">
                    {pets.map((pet) => (
                      <div key={pet.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{pet.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estado: {pet.status}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Dueño: {pet.ownerId ?? 'Desconocido'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pet.status === 'LOST' && (
                              <button
                                onClick={() => handleUpdatePetStatus(pet, 'FOUND')}
                                className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                              >
                                Marcar encontrado
                              </button>
                            )}
                            {pet.status !== 'REUNITED' && (
                              <button
                                onClick={() => handleUpdatePetStatus(pet, 'REUNITED')}
                                className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                              >
                                Marcar reunido
                              </button>
                            )}
                            <button
                              onClick={() => pet.id && handleDeletePet(pet.id)}
                              className="rounded-xl border border-red-600 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {showRegisterModal && (
        <AdminRegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegisterUser}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => {
  const classes: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-300'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-300'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      darkBg: 'dark:bg-yellow-900/20',
      darkText: 'dark:text-yellow-300'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      darkBg: 'dark:bg-green-900/20',
      darkText: 'dark:text-green-300'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      darkBg: 'dark:bg-purple-900/20',
      darkText: 'dark:text-purple-300'
    }
  };

  const colorClasses = classes[color] ?? classes.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`rounded-xl p-2 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.darkBg} ${colorClasses.darkText}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
