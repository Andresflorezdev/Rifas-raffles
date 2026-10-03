import { Save, X } from 'lucide-react';
import { useState } from 'react';
import type { NumberStatus } from '../../types/raffle';
import type { RaffleNumberView } from '../../hooks/useRaffle';

const statuses: NumberStatus[] = ['disponible', 'apartado', 'pagado'];
const buyerNamePattern = /^[\p{L}\s]+$/u;

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
  const [status, setStatus] = useState<NumberStatus>(number.status);
  const [buyer, setBuyer] = useState(number.buyer);
  const [notes, setNotes] = useState(number.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (buyer.trim() && !buyerNamePattern.test(buyer.trim())) return;
    setSaving(true);
    try {
      await onSave(status, buyer, notes);
    } finally {
      setSaving(false);
    }
  };

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
        <fieldset className="status-options">
          <legend>Estado de la compra</legend>
          {statuses.map((item) => (
            <label
              key={item}
              className={`status-option ${status === item ? 'chosen' : ''}`}
            >
              <input
                type="radio"
                name="number-status"
                value={item}
                checked={status === item}
                onChange={() => setStatus(item)}
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
          Nombre del comprador
          <input
            value={buyer}
            onChange={(event) =>
              setBuyer(event.target.value.replace(/[^\p{L}\s]/gu, ''))
            }
            placeholder="Ej. Camila Rojas"
          />
        </label>
        <label className="modal-label">
          Notas del comprador
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Teléfono, referencia u otra información"
            rows={3}
          />
        </label>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="primary-button"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </section>
    </div>
  );
}
