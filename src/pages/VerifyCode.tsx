import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from '../components/ThemeToggle';

export function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const setDemoAuthenticated = useAuthStore(
    (state) => state.setDemoAuthenticated,
  );
  const email = sessionStorage.getItem('raffles-email') || '';
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      navigate('/', { replace: true });
      return;
    }
    if (token.length !== 6) return setError('El código debe tener 6 dígitos.');
    setChecking(true);
    if (isSupabaseConfigured) {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (verifyError) {
        setError(verifyError.message);
        setChecking(false);
        return;
      }
      setSession(data.session);
    } else {
      setDemoAuthenticated(true);
    }
    navigate('/inicio', { replace: true, state: { from: location.pathname } });
  };

  return (
    <main className="auth-shell verify-shell">
      <section className="auth-art">
        <div className="brand-mark">✦ rifas</div>
        <div className="art-copy">
          <span className="eyebrow">Casi estamos</span>
          <h1>
            Un código
            <br />
            <em>y listo.</em>
          </h1>
          <p>Tu espacio de trabajo te está esperando.</p>
        </div>
        <div className="ticket-stack" aria-hidden="true">
          <span>VERIFICACIÓN</span>
          <strong>✦ · ✦ · ✦</strong>
        </div>
      </section>
      <section className="auth-panel">
        <ThemeToggle />
        <div className="auth-panel-inner">
          <button className="back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={17} /> Cambiar correo
          </button>
          <p className="step-label">Verificación</p>
          <h2>Revisa tu bandeja</h2>
          <p className="muted">
            Enviamos un código de 6 dígitos a{' '}
            <strong>{email || 'tu correo'}</strong>.
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Código de acceso
              <input
                className="code-input"
                value={token}
                onChange={(event) =>
                  setToken(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                inputMode="numeric"
                placeholder="000000"
                autoFocus
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" disabled={checking}>
              {checking ? 'Verificando...' : 'Entrar a mis rifas'}{' '}
              <ArrowRight size={18} />
            </button>
          </form>
          {!isSupabaseConfigured && (
            <p className="demo-note">
              En modo demo, usa cualquier código de 6 dígitos.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
