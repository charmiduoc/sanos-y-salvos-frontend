import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Flame, Layers, Loader2 } from 'lucide-react';
import L from 'leaflet';
import geoService from '../service/geo.service';
import petService from '../service/pet.service';
import type { Ubicacion, Mascota } from '../types';

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
}

export const UiMap: React.FC = () => {
  const [modoVista, setModoVista] = useState<'puntos' | 'heatmap'>('puntos');
  const [ubicaciones, setUbicaciones] = useState<LocationWithPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const posicionCentral: [number, number] = [-33.4489, -70.6693];

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    try {
      setIsLoading(true);
      const data = await geoService.getAll();
      
      const ubicacionesConPet = await Promise.all(
        data.map(async (ubicacion) => {
          try {
            const pet = await petService.getById(ubicacion.reportId);
            return {
              ...ubicacion,
              petName: pet.name,
              petStatus: pet.status
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
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Map color="#3b82f6" />
          Visor Geográfico
        </h3>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
          <button onClick={() => setModoVista('puntos')} style={{
            padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
            backgroundColor: modoVista === 'puntos' ? '#ffffff' : 'transparent',
            color: modoVista === 'puntos' ? '#1e293b' : '#64748b'
          }}>Marcadores</button>
          <button onClick={() => setModoVista('heatmap')} style={{
            padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
            backgroundColor: modoVista === 'heatmap' ? '#ffffff' : 'transparent',
            color: modoVista === 'heatmap' ? '#1e293b' : '#64748b'
          }}><Flame size={14} style={{ display: 'inline', marginRight: '4px' }} /> Calor</button>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative',zIndex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f8fafc' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#dc2626' }}>
            {error}
          </div>
        ) : (
          <MapContainer center={posicionCentral} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {modoVista === 'puntos' && ubicaciones.map((ubicacion) => {
              const coordinates = ubicacion.posicion.coordinates;
              return (
                <Marker key={ubicacion.id} position={[coordinates[1], coordinates[0]]}>
                  <Popup>
                    <div style={{ fontSize: '13px' }}>
                      <strong>{ubicacion.petName || 'Mascota'}</strong><br />
                      {ubicacion.descripcion}<br />
                      <small>Estado: {ubicacion.petStatus || 'Desconocido'}</small><br />
                      <small>{new Date(ubicacion.fechaRegistro).toLocaleString()}</small>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#475569', zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Layers size={12} />
          <span>{ubicaciones.length} ubicaciones cargadas</span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};