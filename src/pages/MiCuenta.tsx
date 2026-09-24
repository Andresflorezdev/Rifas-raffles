import { Check, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { AppHeader } from '../components/AppHeader';

export function MiCuenta() {
  const [name, setName] = useState(
    sessionStorage.getItem('raffles-name') || '',
  );
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
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
          setError(updateError.message);
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
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Teléfono <span className="label-hint">opcional</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
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
      </div>
    </main>
  );
}
