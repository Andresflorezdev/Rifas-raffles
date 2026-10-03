import { CalendarDays, Save, X } from 'lucide-react';
import type { Raffle } from '../../types/raffle';
import { RaffleImageInput } from './RaffleImageInput';
import { useRaffleEdit } from '../../hooks/useRaffleEdit';

interface RaffleEditModalProps {
  raffle: Raffle;
  onClose: () => void;
  onSave: (
    values: Pick<
      Raffle,
      | 'nombre'
      | 'descripcion'
      | 'imagen_url'
      | 'cantidad_numeros'
      | 'precio_numero'
      | 'fecha_sorteo'
    >,
  ) => Promise<boolean>;
}

export function RaffleEditModal({
  raffle,
  onClose,
  onSave,
}: RaffleEditModalProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    drawDate,
    setDrawDate,
    currentImageUrl,
    imageFile,
    saving,
    error,
    today,
    hasChanges,
    handleImageChange,
    handleSubmit,
  } = useRaffleEdit({ raffle, onClose, onSave });

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="number-modal raffle-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="raffle-edit-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow coral-text">Editar rifa</p>
            <h2 id="raffle-edit-title">{raffle.nombre}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={19} />
          </button>
        </div>
        <form className="raffle-edit-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            <span className="field-label">
              Nombre de la rifa <span className="required-mark">*</span>
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="modal-label">
            <span className="field-label">
              Descripción del premio <span className="required-mark">*</span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>

          <RaffleImageInput
            currentImageUrl={currentImageUrl}
            selectedFile={imageFile}
            onChange={handleImageChange}
          />

          <div className="form-grid">
            <label className="modal-label">
              <span className="field-label">
                Cantidad de números <span className="required-mark">*</span>
              </span>
              <input
                type="number"
                value={raffle.cantidad_numeros}
                disabled
                title="La cantidad no se puede cambiar después de crear la rifa."
              />
            </label>
            <label className="modal-label">
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
          <label className="modal-label">
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
          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="primary-button"
              disabled={saving || !hasChanges}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
