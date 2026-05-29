import { UiReportCard } from './components/UiReportCard';
import { UiMap } from './components/UiMap';
import { ShieldCheck } from 'lucide-react';

const REPORTES_MOCK = [
  {
    id: '1',
    nombre: 'Rocky',
    especie: 'Perro (Pastor Alemán)',
    descripcion: 'Se asustó con unos fuegos artificiales. Es amigable pero muy asustadizo.',
    fechaMencion: 'Reportado hoy a las 14:00',
    ultimaUbicacion: 'Cerca de Plaza de Armas',
    estado: 'PERDIDO' as const
  },
  {
    id: '2',
    nombre: 'Luna',
    especie: 'Gato (Siamés)',
    descripcion: 'Tiene un collar morado con su cascabel. No suele salir de casa.',
    fechaMencion: 'Reportado ayer',
    ultimaUbicacion: 'Av. Las Condes #1240',
    estado: 'PERDIDO' as const
  }
];

function App() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui' }}>
      
      {/* Header General */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <ShieldCheck size={36} color="#10b981" />
        <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Sanos y Salvos</h1>
      </header>

      {/* Distribución limpia en una sola columna grande */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* MÓDULO VISOR: ui-map */}
        <section>
          <UiMap />
        </section>

        {/* MÓDULO LISTADO: ui-report-card */}
        <section>
          <h2 style={{ fontSize: '20px', color: '#334155', marginBottom: '16px' }}>Mascotas perdidas recientemente</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {REPORTES_MOCK.map(reporte => (
              <UiReportCard key={reporte.id} report={reporte} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;