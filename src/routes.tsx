import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

const Home = lazy(() =>
  import('./pages/Home').then(({ Home }) => ({ default: Home })),
);
const LoginRegistro = lazy(() =>
  import('./pages/LoginRegistro').then(({ LoginRegistro }) => ({
    default: LoginRegistro,
  })),
);
const MiCuenta = lazy(() =>
  import('./pages/MiCuenta').then(({ MiCuenta }) => ({ default: MiCuenta })),
);
const RaffleDetail = lazy(() =>
  import('./pages/RaffleDetail').then(({ RaffleDetail }) => ({
    default: RaffleDetail,
  })),
);
const RaffleForm = lazy(() =>
  import('./pages/RaffleForm').then(({ RaffleForm }) => ({
    default: RaffleForm,
  })),
);
const VerifyCode = lazy(() =>
  import('./pages/VerifyCode').then(({ VerifyCode }) => ({
    default: VerifyCode,
  })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="app-loading">Cargando...</div>}>
      <Routes>
        {/* Rutas de autenticación (Solo accesibles si NO has iniciado sesión) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LoginRegistro />} />
          <Route path="/verificar" element={<VerifyCode />} />
        </Route>

        {/* Rutas privadas (Solo accesibles si estás autenticado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inicio" element={<Home />} />
          <Route path="/cuenta" element={<MiCuenta />} />
          <Route path="/rifa/nueva" element={<RaffleForm />} />
          <Route path="/rifa/:raffleId" element={<RaffleDetail />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
