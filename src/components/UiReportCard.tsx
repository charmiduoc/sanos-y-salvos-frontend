import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, MessageSquare, Image as ImageIcon } from 'lucide-react';
import type { Mascota } from '../types';
import imageService from '../service/image.service';

interface Props {
  report: Mascota;
  onViewLocation?: (petId: string) => void;
}

export const UiReportCard: React.FC<Props> = ({ report, onViewLocation }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    loadImage();
  }, [report.imageId]);

  const loadImage = async () => {
    if (report.imageId) {
      setIsLoadingImage(true);
      try {
        const url = imageService.getImageUrl(report.imageId);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setIsLoadingImage(false);
      }
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
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        backgroundColor: statusColors[report.status] || '#64748b',
        color: '#ffffff',
        padding: '6px 12px',
        fontWeight: 'bold',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {statusLabels[report.status] || report.status}
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          {isLoadingImage ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ImageIcon size={24} color="#94a3b8" />
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={report.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ImageIcon size={24} color="#94a3b8" />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b' }}>
            {report.name}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0' }}>
            {report.species} {report.breed && `• ${report.breed}`} {report.color && `• ${report.color}`}
          </p>
          
          <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            {report.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            {report.lastLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#ef4444" />
                <span>
                  {report.lastLocation.address || `${report.lastLocation.latitude}, ${report.lastLocation.longitude}`}
                </span>
              </div>
            )}
            {report.reportedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#3b82f6" />
                <span>Reportado: {new Date(report.reportedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button onClick={() => onViewLocation?.(report.id!)} style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <MessageSquare size={14} />
            Ver avistamientos
          </button>
        </div>
      </div>
    </div>
  );
};