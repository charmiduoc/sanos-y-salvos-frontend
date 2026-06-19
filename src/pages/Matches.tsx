import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GitCompare, AlertTriangle } from 'lucide-react';
import matchService from '../service/match.service';
import type { MatchResponse, Usuario } from '../types';

interface MatchesProps {
  currentUser: Usuario | null;
}

export const Matches: React.FC<MatchesProps> = ({ currentUser }) => {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMatches = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const ownerMatches = await matchService.getByOwnerId(currentUser.id);
      const founderMatches = await matchService.getByFounderId(currentUser.id);
      const combined = [...ownerMatches, ...founderMatches];
      setMatches(combined);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('No se pudieron cargar las coincidencias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-700 dark:text-gray-300">
          <h1 className="text-3xl font-bold mb-4">Inicia sesión para ver tus coincidencias</h1>
          <p>Accede con tu cuenta para revisar y gestionar tus matches de mascotas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coincidencias</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                Aquí se muestran todas las coincidencias relacionadas con tus reportes.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white shadow-sm">
              <GitCompare className="h-5 w-5" />
              Mis Matches
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-md text-center text-gray-500 dark:text-gray-400">
            Cargando coincidencias...
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-md text-center text-gray-700 dark:text-gray-300">
            <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold">No hay coincidencias aún</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aún no hay matches asociados a tu cuenta.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Match #{match.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado: {match.status}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score: {match.similarityScore}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Motivo: {match.matchReason || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reportado: {new Date(match.matchedAt).toLocaleDateString()}</p>
                    {match.respondedAt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Respondido: {new Date(match.respondedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {match.ownerId === currentUser.id ? 'Propietario' : 'Buscador'}
                    </span>
                    {match.status === 'PENDING' ? (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                        Pendiente
                      </span>
                    ) : match.status === 'ACCEPTED' ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        Aceptado
                      </span>
                    ) : match.status === 'REJECTED' ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        Rechazado
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Completado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
