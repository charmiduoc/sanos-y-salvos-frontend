import React from 'react';
import { MapPin, Calendar, MessageSquare } from 'lucide-react';

// Definimos la estructura exacta que tiene una mascota reportada
interface PetReport {
  id: string;
  nombre: string;
  especie: string;
  descripcion: string;
  fechaMencion: string;
  ultimaUbicacion: string;
  estado: 'PERDIDO' | 'ENCONTRADO';
}

interface Props {
  report: PetReport;
}

export const UiReportCard: React.FC<Props> = ({ report }) => {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Marcador de Estado */}
      <div style={{
        backgroundColor: report.estado === 'PERDIDO' ? '#ef4444' : '#10b981',
        color: '#ffffff',
        padding: '6px 12px',
        fontWeight: 'bold',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {report.estado}
      </div>

      {/* Contenido de la Tarjeta */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1e293b' }}>
          {report.nombre} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>({report.especie})</span>
        </h3>
        
        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          {report.descripcion}
        </p>

        {/* Detalles con iconos de Lucide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#ef4444" />
            <span>{report.ultimaUbicacion}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#3b82f6" />
            <span>{report.fechaMencion}</span>
          </div>
        </div>

        {/* Botón de acción */}
        <button style={{
          marginTop: '16px',
          width: '100%',
          padding: '10px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <MessageSquare size={16} />
          Ver avistamientos en mapa
        </button>
      </div>
    </div>
  );
};