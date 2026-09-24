import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute() {
  const session = useAuthStore((state) => state.session);
  const demoAuthenticated = useAuthStore((state) => state.demoAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  if (loading)
    return <div className="loading-screen">Cargando tu espacio...</div>;
  return session || demoAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}
