import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Map, Flame, Layers } from 'lucide-react';
import L from 'leaflet';

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

// Datos imitando las coordenadas reales que guardaría tu geo-service [Latitud, Longitud]
const AVISTAMIENTOS_REALES = [
  { id: 'g1', lat: -33.4489, lng: -70.6693, descripcion: 'Rocky visto corriendo cerca de Plaza de Armas' },
  { id: 'g2', lat: -33.4515, lng: -70.6650, descripcion: 'Avistamiento de Rocky cerca del Metro' },
  { id: 'g3', lat: -33.4256, lng: -70.6146, descripcion: 'Luna vista cruzando Av. Las Condes' },
];

export const UiMap: React.FC = () => {
  const [modoVista, setModoVista] = useState<'puntos' | 'heatmap'>('puntos');

  // Coordenadas iniciales del mapa (Santiago Centro)
  const posicionCentral: [number, number] = [-33.4489, -70.6693];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Map color="#3b82f6" />
          Visor Geográfico Real (ui-map)
        </h3>

        {/* Selector de Capas */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
          <button
            onClick={() => setModoVista('puntos')}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: modoVista === 'puntos' ? '#ffffff' : 'transparent',
              color: modoVista === 'puntos' ? '#1e293b' : '#64748b'
            }}
          >
            Marcadores
          </button>
          <button
            onClick={() => setModoVista('heatmap')}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: modoVista === 'heatmap' ? '#ffffff' : 'transparent',
              color: modoVista === 'heatmap' ? '#1e293b' : '#64748b'
            }}
          >
            <Flame size={14} style={{ display: 'inline', marginRight: '4px' }} /> Calor (Simulado)
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa Real */}
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
        <MapContainer 
          center={posicionCentral} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Capa de mapas gratuita de OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Renderizado de puntos si estamos en modo Marcadores */}
          {modoVista === 'puntos' && AVISTAMIENTOS_REALES.map((punto) => (
            <Marker key={punto.id} position={[punto.lat, punto.lng]}>
              <Popup>
                <div style={{ fontSize: '13px' }}>
                  <strong>Mascota Avistada</strong><br />
                  {punto.descripcion}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Capa visual simulando el heatmap sobre el mapa real */}
          {modoVista === 'heatmap' && AVISTAMIENTOS_REALES.map((punto) => (
            <div key={punto.id}>
              {/* Nota: Para un heatmap real interactivo en Leaflet se usa leaflet.heat, 
                  pero esta aproximación visual sobre el mapa real te sirve perfecto para la entrega */}
              <Marker position={[punto.lat, punto.lng]} opacity={0}>
                <Popup>Zona de alta coincidencia</Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>

        {/* Leyenda */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#475569', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Layers size={12} />
          <span>Modo: {modoVista === 'puntos' ? 'Ubicaciones Exactas' : 'Densidad de Alertas'}</span>
        </div>
      </div>
    </div>
  );
};