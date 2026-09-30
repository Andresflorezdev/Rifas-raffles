import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './theme.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

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

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => initialize(), [initialize]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading">Cargando...</div>}>
        <Routes>
          <Route path="/" element={<LoginRegistro />} />
          <Route path="/verificar" element={<VerifyCode />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/inicio" element={<Home />} />
            <Route path="/cuenta" element={<MiCuenta />} />
            <Route path="/rifa/nueva" element={<RaffleForm />} />
            <Route path="/rifa/:raffleId" element={<RaffleDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
