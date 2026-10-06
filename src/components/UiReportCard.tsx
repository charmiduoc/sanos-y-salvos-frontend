// src/components/UiReportCard.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, MessageSquare, Image as ImageIcon, Eye, Trash2, Loader2, CheckCircle } from 'lucide-react';
import type { Mascota } from '../types';
import imageService from '../service/image.service';
import petService from '../service/pet.service';
import geoService from '../service/geo.service';
import toast from 'react-hot-toast';

interface Props {
  report: Mascota;
  onViewLocation?: (petId: string) => void;
  onViewDetails?: (petId: string) => void;
  onDelete?: (petId: string) => void;
  onStatusChange?: (petId: string, nuevoEstado: string) => void;
  currentUserId?: string;
}

export const UiReportCard: React.FC<Props> = ({
  report,
  onViewLocation,
  onViewDetails,
  onDelete,
  onStatusChange,
  currentUserId
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = currentUserId && report.ownerId === currentUserId;

  useEffect(() => {
    loadImage();
  }, [report.imageId]);

  const loadImage = async () => {
    if (!report.imageId) return;
    setIsLoadingImage(true);
    setImageError(false);
    try {
      const url = imageService.getImageUrl(report.imageId);
      const exists = await imageService.exists(report.imageId);
      if (exists) setImageUrl(url);
      else setImageError(true);
    } catch (error) {
      console.error('Error loading image:', error);
      setImageError(true);
    } finally {
      setIsLoadingImage(false);
    }
  };

  //NUEVO: Marcar como encontrada (dispara CloudAMQP)
  const handleMarkAsFound = async () => {
    if (!report.id) return;
    try {
      setIsUpdatingStatus(true);
      const loadingToast = toast.loading('Marcando como encontrada...');

      await petService.updateStatus(
        report.id,
        'FOUND',
        currentUserId || 'anonimo'
      );

      toast.dismiss(loadingToast);
      toast.success('¡Mascota marcada como encontrada!');

      if (onStatusChange) onStatusChange(report.id, 'FOUND');
    } catch (error) {
      console.error('Error al marcar como encontrada:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  //NUEVO: Marcar como reunida
  const handleMarkAsReunited = async () => {
    if (!report.id) return;
    try {
      setIsUpdatingStatus(true);
      const loadingToast = toast.loading('Marcando como reunida...');

      await petService.updateStatus(report.id, 'REUNITED');

      toast.dismiss(loadingToast);
      toast.success('¡Mascota marcada como reunida!');

      if (onStatusChange) onStatusChange(report.id, 'REUNITED');
    } catch (error) {
      console.error('Error al marcar como reunida:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!report.id) return;
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      const loadingToast = toast.loading('Eliminando reporte...');

      try {
        const ubicaciones = await geoService.getAll();
        const ubicacion = ubicaciones.find((u: any) => u.reportId === report.id);
        if (ubicacion) await geoService.delete(ubicacion.id);
      } catch (geoError) {
        console.warn('Error al eliminar ubicacion:', geoError);
      }

      const success = await petService.delete(report.id);
      if (!success) throw new Error('No se pudo eliminar el reporte');

      if (report.imageId) {
        try { await imageService.delete(report.imageId); } catch (imgError) {}
      }

      toast.dismiss(loadingToast);
      toast.success('Reporte eliminado exitosamente');
      if (onDelete) onDelete(report.id);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColors: Record<string, string> = {
    LOST: '#ef4444',
    FOUND: '#10b981',
    REUNITED: '#8b5cf6'
  };

  const statusLabels: Record<string, string> = {
    LOST: 'PERDIDO',
    FOUND: 'ENCONTRADO',
    REUNITED: 'REUNIDO'
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
      <div
        className="px-3 py-1.5 text-center text-white font-bold text-sm flex justify-between items-center flex-shrink-0"
        style={{ backgroundColor: statusColors[report.status] || '#64748b' }}
      >
        <span>{statusLabels[report.status] || report.status}</span>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            className="text-white hover:text-red-200 transition-colors p-1 rounded hover:bg-white/20"
            title="Eliminar reporte"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4 flex gap-3 flex-1">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          {isLoadingImage ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="text-gray-400 animate-spin" />
            </div>
          ) : imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={report.name}
              className="w-full h-full object-cover"
              onError={() => {
                setImageError(true);
                setImageUrl(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5 truncate">
            {report.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {report.species} {report.breed && `• ${report.breed}`} {report.color && `• ${report.color}`}
          </p>

          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {report.description || 'Sin descripción'}
          </div>

          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 flex-1">
            {report.lastLocation && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-red-500 flex-shrink-0" />
                <span className="truncate">
                  {report.lastLocation.address || `${report.lastLocation.latitude}, ${report.lastLocation.longitude}`}
                </span>
              </div>
            )}
            {report.reportedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500 flex-shrink-0" />
                <span>Reportado: {new Date(report.reportedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (report.id) onViewLocation?.(report.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <MessageSquare size={14} />
              Avistamientos
            </button>

            {onViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (report.id) onViewDetails?.(report.id);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Eye size={14} />
                Detalles
              </button>
            )}
          </div>

          {report.status === 'LOST' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsFound();
              }}
              disabled={isUpdatingStatus}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingStatus ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              ¡La encontré!
            </button>
          )}

          {/* BOTÓN NUEVO: Marcar como reunida (solo dueño) */}
          {report.status === 'FOUND' && isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsReunited();
              }}
              disabled={isUpdatingStatus}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingStatus ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Ya está conmigo
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">¿Eliminar reporte?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar el reporte de <strong>{report.name}</strong>? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};