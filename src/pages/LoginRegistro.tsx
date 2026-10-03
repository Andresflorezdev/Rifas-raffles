import type { FormEvent } from 'react';
import { useState } from 'react';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { ThemeToggle } from '../components/ThemeToggle';
import { getUserFriendlyError } from '../lib/errorMessages';

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
        setError(
          getUserFriendlyError(authError, 'No se pudo enviar el código.'),
        );
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
      <div className="auth-glow" />
      <header className="auth-header">
        <span className="brand-badge">
          <Sparkles size={16} /> Rifas App
        </span>
        <ThemeToggle />
      </header>
      <section className="auth-card">
        <p className="eyebrow coral-text">Acceso rápido y seguro</p>
        <h1>Entra o crea tu cuenta sin contraseñas.</h1>
        <p className="muted">
          Te enviaremos un código de 6 dígitos a tu correo para ingresar en
          segundos.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
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
            {sending ? 'Enviando código...' : 'Continuar'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}
