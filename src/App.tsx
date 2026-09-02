import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './guards/AuthGuard';
import { Login } from './components/Auth/Login';
import { RegisterModal } from './components/Auth/RegisterModal';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { MapPage } from './pages/MapPage';
import { Matches } from './pages/Matches';
import { Report } from './pages/Report';
import { PetDetailsPage } from './pages/PetDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={<RegisterModal onClose={() => {}} onRegister={() => {}} isLoading={false} />}
        />

        {/* Rutas protegidas - cualquier usuario autenticado */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/map"
          element={
            <AuthGuard>
              <MapPage />
            </AuthGuard>
          }
        />

        <Route
          path="/matches"
          element={
            <AuthGuard>
              <Matches />
            </AuthGuard>
          }
        />

        <Route
          path="/report"
          element={
            <AuthGuard>
              <Report />
            </AuthGuard>
          }
        />

        <Route
          path="/pet/:id"
          element={
            <AuthGuard>
              <PetDetailsPage />
            </AuthGuard>
          }
        />

        {/* Rutas protegidas - solo administradores */}
        <Route
          path="/admin"
          element={
            <AuthGuard requiredRole="ADMIN">
              <AdminPanel />
            </AuthGuard>
          }
        />

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/unauthorized" element={<div className="p-8 text-center text-2xl">No autorizado</div>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;