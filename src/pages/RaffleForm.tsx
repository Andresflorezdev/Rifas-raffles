import { CalendarDays, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { RaffleImageInput } from '../components/raffles/RaffleImageInput';
import { useRaffleForm } from '../hooks/useRaffleForm';

export function RaffleForm() {
  const navigate = useNavigate();
  const {
    name,
    setName,
    description,
    setDescription,
    imageFile,
    setImageFile,
    quantity,
    setQuantity,
    price,
    setPrice,
    drawDate,
    setDrawDate,
    error,
    saving,
    today,
    handleSubmit,
  } = useRaffleForm();

  return (
    <main className="app-shell form-page">
      <AppHeader backLabel="Volver a mis rifas" />
      <div className="form-content">
        <p className="eyebrow coral-text">Nueva rifa</p>
        <h1>Cuéntanos qué vas a sortear.</h1>
        <p className="muted">
          Define los detalles y nosotros prepararemos tus números
          automáticamente.
        </p>
        <form className="raffle-form" onSubmit={handleSubmit}>
          <label>
            <span className="field-label">
              Nombre de la rifa <span className="required-mark">*</span>
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Kit de café de especialidad"
            />
          </label>
          <label>
            <span className="field-label">
              Descripción del premio <span className="required-mark">*</span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Cuenta brevemente qué incluye el premio"
              rows={4}
            />
          </label>

          <RaffleImageInput
            selectedFile={imageFile}
            onChange={(file) => setImageFile(file)}
          />

          <div className="form-grid">
            <label>
              <span className="field-label">
                Cantidad de números <span className="required-mark">*</span>
              </span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">
                Precio por número <span className="required-mark">*</span>
              </span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </label>
          </div>
          <label>
            <span className="field-label">
              Fecha del sorteo <span className="required-mark">*</span>
            </span>
            <div className="input-icon">
              <CalendarDays size={18} />
              <input
                type="date"
                min={today}
                value={drawDate}
                onChange={(event) => setDrawDate(event.target.value)}
              />
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/inicio')}
            >
              Cancelar
            </button>
            <button className="primary-button" disabled={saving}>
              <Save size={17} /> {saving ? 'Guardando...' : 'Crear rifa'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
