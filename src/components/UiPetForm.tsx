import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

export const UiPetForm: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Perro');
  const [descripcion, setDescripcion] = useState('');
  const [ultimaUbicacion, setUltimaUbicacion] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // El JSON mockeado que calzará con el pet-service
    const nuevoReporte = {
      nombre,
      especie,
      descripcion,
      ultimaUbicacion,
      estado: 'PERDIDO',
      fechaRegistro: new Date().toISOString()
    };

    console.log('Datos listos para enviar:', nuevoReporte);
    
    setEnviado(true);
    setNombre('');
    setDescripcion('');
    setUltimaUbicacion('');

    setTimeout(() => setEnviado(false), 4000);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle color="#ef4444" />
        Ingresar Reporte de Mascota
      </h3>

      {enviado && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '500'
        }}>
          <CheckCircle size={18} />
          ¡Formulario validado localmente con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '6px', color: '#475569' }}>Nombre de la mascota</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Rocky, Luna..."
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '6px', color: '#475569' }}>Especie</label>
          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
          >
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '6px', color: '#475569' }}>Última ubicación conocida</label>
          <input
            type="text"
            required
            value={ultimaUbicacion}
            onChange={(e) => setUltimaUbicacion(e.target.value)}
            placeholder="Ej: Av. República con Alameda"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '6px', color: '#475569' }}>Descripción / Detalles</label>
          <textarea
            required
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Color del pelaje, si tiene collar, señas particulares..."
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Publicar Alerta
        </button>
      </form>
    </div>
  );
};