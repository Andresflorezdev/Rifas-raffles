import { Check, UserRound } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useProfile } from '../hooks/useProfile';

export function MiCuenta() {
  const {
    name,
    phone,
    saved,
    error,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
  } = useProfile();

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
                onChange={(event) => handleNameChange(event.target.value)}
              />
            </label>
            <label>
              Teléfono
              <input
                value={phone}
                type="tel"
                inputMode="tel"
                maxLength={20}
                onChange={(event) => handlePhoneChange(event.target.value)}
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
