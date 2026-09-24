import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { ThemeToggle } from '../components/ThemeToggle';

export function LoginRegistro() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nombre.trim()) return setError('Escribe tu nombre para continuar.');
    if (!email.includes('@')) return setError('Escribe un correo válido.');
    setError('');
    setSending(true);
    if (isSupabaseConfigured) {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { data: { nombre: nombre.trim() } },
      });
      if (authError) {
        setError(authError.message);
        setSending(false);
        return;
      }
    }
    sessionStorage.setItem('raffles-email', email);
    sessionStorage.setItem('raffles-name', nombre.trim());
    navigate('/verificar');
  };

  return (
    <main className="auth-shell">
      <section className="auth-art" aria-label="Resumen de Rifas">
        <div className="brand-mark">
          <Sparkles size={18} /> rifas
        </div>
        <div className="art-copy">
          <span className="eyebrow">Organiza. Aparta. Gana.</span>
          <h1>
            Tus rifas,
            <br />
            <em>en orden.</em>
          </h1>
          <p>
            Una forma clara y bonita de llevar el control de cada número y cada
            comprador.
          </p>
        </div>
        <div className="ticket-stack" aria-hidden="true">
          <span>• • • • • • • •</span>
          <strong>01 · 24 · 88</strong>
        </div>
      </section>
      <section className="auth-panel">
        <ThemeToggle />
        <div className="auth-panel-inner">
          <span className="mobile-brand">rifas</span>
          <p className="step-label">Bienvenido</p>
          <h2>Empieza tu próxima rifa</h2>
          <p className="muted">
            Entra con tu correo. Te enviaremos un código de acceso, sin
            contraseñas.
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Tu nombre
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Camila Rojas"
                autoComplete="name"
              />
            </label>
            <label>
              Correo electrónico
              <div className="input-icon">
                <Mail size={18} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="camila@correo.com"
                  type="email"
                  autoComplete="email"
                />
              </div>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" disabled={sending}>
              {sending ? 'Enviando código...' : 'Continuar'}{' '}
              <ArrowRight size={18} />
            </button>
          </form>
          {!isSupabaseConfigured && (
            <p className="demo-note">
              Modo demo activo: puedes explorar la interfaz sin conectar
              Supabase todavía.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
