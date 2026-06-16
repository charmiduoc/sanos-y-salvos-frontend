import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { UiPetForm } from '../components/UiPetForm';

interface ReportProps {
  ownerId?: string;
}

export const Report: React.FC<ReportProps> = ({ ownerId }) => {
  return (
    <div className="pt-[72px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nuevo reporte</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
            Completa los datos de la mascota perdida para avisar a la comunidad. Esta opción solo está disponible para usuarios registrados.
          </p>
        </motion.div>

        {ownerId ? (
          <UiPetForm ownerId={ownerId} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Inicia sesión para crear un reporte</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Solo los usuarios registrados pueden subir alertas de mascotas perdidas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 27f71ba (Modificación margen de inocos de tarjetas de administrador y se se arregla crud para registrar usuarios)
