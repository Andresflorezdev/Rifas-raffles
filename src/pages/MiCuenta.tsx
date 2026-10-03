import { Check, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { AppHeader } from '../components/AppHeader';
import { getUserFriendlyError } from '../lib/errorMessages';

const namePattern = /^[\p{L}\s]+$/u;

function sanitizePhone(value: string) {
  const allowedCharacters = value.replace(/[^\d+\s()-]/g, '');
  let digitCount = 0;
  return [...allowedCharacters]
    .filter((character) => {
      if (/\d/.test(character)) digitCount += 1;
      return digitCount <= 15;
    })
    .join('');
}

export function MiCuenta() {
  const [name, setName] = useState(
    sessionStorage.getItem('raffles-name') || '',
  );
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('nombre, telefono')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) {
        setError(
          getUserFriendlyError(
            profileError,
            'No se pudo cargar tu información.',
          ),
        );
        return;
      }
      if (profile) {
        setName(profile.nombre || '');
        setPhone(sanitizePhone(profile.telefono || ''));
      }
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!namePattern.test(name.trim())) {
      setError('El nombre solo puede contener letras y espacios.');
      return;
    }
    setError('');
    if (isSupabaseConfigured) {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { error: updateError } = await supabase
          .from('perfiles')
          .update({ nombre: name.trim(), telefono: phone.trim() || null })
          .eq('id', user.id);
        if (updateError) {
          setError(
            getUserFriendlyError(
              updateError,
              'No se pudieron guardar los cambios.',
            ),
          );
          return;
        }
      }
    }
    sessionStorage.setItem('raffles-name', name.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="app-shell form-page">
      <AppHeader />
      <div className="account-content">
        <section className="account-card">
          <div className="account-icon">
            <UserRound size={28} />
          </div>
          <p className="eyebrow coral-text">Mi cuenta</p>
          <h1>Tus datos, siempre bajo control.</h1>
          <p className="muted">
            Actualiza la información con la que gestionas tus rifas.
          </p>
          <form className="account-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value.replace(/[^\p{L}\s]/gu, ''))
                }
              />
            </label>
            <label>
              Teléfono <span className="label-hint">opcional</span>
              <input
                value={phone}
                type="tel"
                inputMode="tel"
                maxLength={20}
                onChange={(event) =>
                  setPhone(sanitizePhone(event.target.value))
                }
                placeholder="+57 300 000 0000"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            {saved && (
              <p className="saved-message">
                <Check size={16} /> Cambios guardados
              </p>
            )}
            <button className="primary-button">Guardar cambios</button>
          </form>
        </section>
      </div>
    </main>
  );
}
