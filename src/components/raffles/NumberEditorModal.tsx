import { Save, X } from 'lucide-react';
import type { NumberStatus } from '../../types/raffle';
import type { RaffleNumberView } from '../../hooks/useRaffle';
import { NUMBER_STATUSES, useNumberEditor } from '../../hooks/useNumberEditor';

interface NumberEditorModalProps {
  number: RaffleNumberView;
  onClose: () => void;
  onSave: (
    status: NumberStatus,
    buyer: string,
    notes: string,
  ) => Promise<boolean>;
}

export function NumberEditorModal({
  number,
  onClose,
  onSave,
}: NumberEditorModalProps) {
  const {
    status,
    buyer,
    notes,
    error,
    saving,
    isBuyerRequired,
    handleStatusChange,
    handleBuyerChange,
    setNotes,
    handleSubmit,
  } = useNumberEditor({ number, onSave });

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="number-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="number-modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow coral-text">Editar número</p>
            <h2 id="number-modal-title">
              Número #{String(number.number).padStart(2, '0')}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={19} />
          </button>
        </div>
        <p className="muted modal-description">
          Elige el estado de este número y registra los datos del comprador.
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset className="status-options">
            <legend>Estado de la compra</legend>
            {NUMBER_STATUSES.map((item) => (
              <label
                key={item}
                className={`status-option ${status === item ? 'chosen' : ''}`}
              >
                <input
                  type="radio"
                  name="number-status"
                  value={item}
                  checked={status === item}
                  onChange={() => handleStatusChange(item)}
                />
                <span className={`status-dot ${item}`} />
                <span>
                  <strong>{item[0].toUpperCase() + item.slice(1)}</strong>
                  <small>
                    {item === 'disponible'
                      ? 'Nadie lo ha reservado'
                      : item === 'apartado'
                        ? 'El comprador aún debe pagar'
                        : 'Pago confirmado'}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="modal-label">
            <span className="field-label">
              Nombre de la persona{' '}
              {isBuyerRequired && <span className="required-mark">*</span>}
            </span>
            <input
              value={buyer}
              onChange={(event) => handleBuyerChange(event.target.value)}
              placeholder="Ej. Camila Rojas"
              required={isBuyerRequired}
            />
          </label>

          <label className="modal-label">
            <span className="field-label">Notas (opcional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Teléfono, referencia u otra información"
              rows={3}
            />
          </label>

          {error && (
            <p className="form-error" style={{ marginTop: '12px' }}>
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
