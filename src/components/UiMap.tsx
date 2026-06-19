// src/components/UiMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Flame, Layers, Loader2 } from 'lucide-react';
import L from 'leaflet';
import geoService from '../service/geo.service';
import petService from '../service/pet.service';
import type { Ubicacion } from '../types';

import 'leaflet/dist/leaflet.css';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationWithPet extends Ubicacion {
  petName?: string;
  petStatus?: string;
  ownerId?: string;
}

interface UiMapProps {
  currentUserId?: string;
  filterByUser?: boolean;
}

export const UiMap: React.FC<UiMapProps> = ({ currentUserId, filterByUser = false }) => {
  const [modoVista, setModoVista] = useState<'puntos' | 'heatmap'>('puntos');
  const [ubicaciones, setUbicaciones] = useState<LocationWithPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const posicionCentral: [number, number] = [-33.4489, -70.6693];

  useEffect(() => {
    loadUbicaciones();
  }, [currentUserId, filterByUser]);

  const loadUbicaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let ubicacionesData: Ubicacion[] = [];
      
      if (filterByUser && currentUserId) {
        console.log('Cargando ubicaciones del usuario:', currentUserId);
        
        // Intentar método 1
        ubicacionesData = await geoService.getUbicacionesByUserId(currentUserId);
        console.log(`Método 1: ${ubicacionesData.length} ubicaciones encontradas`);
        
        // Si no encuentra, intentar método 2 (alternativo)
        if (ubicacionesData.length === 0) {
          console.log('Intentando método alternativo...');
          ubicacionesData = await geoService.getUbicacionesByUserIdAlt(currentUserId);
          console.log(`Método 2: ${ubicacionesData.length} ubicaciones encontradas`);
        }
      } else {
        console.log('Cargando todas las ubicaciones');
        ubicacionesData = await geoService.getAll();
        console.log(`Encontradas ${ubicacionesData.length} ubicaciones totales`);
      }
      
      // Enriquecer con datos de las mascotas
      const ubicacionesConPet = await Promise.all(
        ubicacionesData.map(async (ubicacion) => {
          try {
            const pet = await petService.getById(ubicacion.reportId);
            return {
              ...ubicacion,
              petName: pet.name,
              petStatus: pet.status,
              ownerId: pet.ownerId
            };
          } catch {
            return ubicacion;
          }
        })
      );
      
      setUbicaciones(ubicacionesConPet);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Error al cargar las ubicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 m-0">
          <Map className="text-blue-500 dark:text-blue-400" size={20} />
          Visor Geográfico
          {filterByUser && currentUserId && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
              (Tus ubicaciones: {ubicaciones.length})
            </span>
          )}
        </h3>

        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg gap-1">
          <button 
            onClick={() => setModoVista('puntos')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              modoVista === 'puntos' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Marcadores
          </button>
          <button 
            onClick={() => setModoVista('heatmap')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              modoVista === 'heatmap' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Flame size={14} />
            Calor
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative z-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <Loader2 size={32} className="text-blue-500 dark:text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : ubicaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <Map size={48} className="mb-2 opacity-50" />
            <p className="text-center">
              {filterByUser 
                ? 'No tienes ubicaciones registradas aún' 
                : 'No hay ubicaciones disponibles'}
            </p>
          </div>
        ) : (
          <MapContainer center={posicionCentral} zoom={13} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {modoVista === 'puntos' && ubicaciones.map((ubicacion) => {
              const coordinates = ubicacion.posicion.coordinates;
              return (
                <Marker key={ubicacion.id} position={[coordinates[1], coordinates[0]]}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-gray-900 dark:text-white">
                        {ubicacion.petName || 'Mascota'}
                      </strong>
                      <br />
                      <span className="text-gray-600 dark:text-gray-300">
                        {ubicacion.descripcion}
                      </span>
                      <br />
                      <small className="text-gray-500 dark:text-gray-400">
                        Estado: {ubicacion.petStatus || 'Desconocido'}
                      </small>
                      <br />
                      <small className="text-gray-500 dark:text-gray-400">
                        {new Date(ubicacion.fechaRegistro).toLocaleString()}
                      </small>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 z-[1000] shadow-md">
          <Layers size={12} />
          <span>{ubicaciones.length} ubicaciones cargadas</span>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          color: #1e293b !important;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .dark .leaflet-popup-tip {
          background: #1e293b !important;
        }
        .leaflet-popup-content-wrapper .leaflet-popup-content {
          color: inherit !important;
        }
        .leaflet-popup-content-wrapper .leaflet-popup-content strong {
          color: inherit !important;
        }
        .leaflet-popup-content-wrapper .leaflet-popup-content small {
          color: inherit !important;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};