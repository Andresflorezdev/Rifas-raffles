import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function PublicOnlyRoute() {
  const session = useAuthStore((state) => state.session);
  const demoAuthenticated = useAuthStore((state) => state.demoAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return session || demoAuthenticated ? (
    <Navigate to="/inicio" replace />
  ) : (
    <Outlet />
  );
}
