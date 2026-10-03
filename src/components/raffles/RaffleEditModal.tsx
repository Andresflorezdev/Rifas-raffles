import { CalendarDays, ImagePlus, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Raffle } from '../../types/raffle';
import { getUserFriendlyError } from '../../lib/errorMessages';
import { uploadRaffleImage } from '../../services/raffleService';

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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RaffleEditModal({
  raffle,
  onClose,
  onSave,
}: RaffleEditModalProps) {
  const [name, setName] = useState(raffle.nombre);
  const [description, setDescription] = useState(raffle.descripcion || '');
  const [price, setPrice] = useState(String(raffle.precio_numero));
  const [drawDate, setDrawDate] = useState(raffle.fecha_sorteo || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = formatLocalDate(new Date());
  const hasChanges =
    name.trim() !== raffle.nombre ||
    description.trim() !== (raffle.descripcion || '') ||
    price !== String(raffle.precio_numero) ||
    drawDate !== (raffle.fecha_sorteo || '') ||
    imageFile !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasChanges) return;
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      Number(price) < 0 ||
      !drawDate ||
      drawDate < today
    ) {
      setError(
        'Completa los campos obligatorios y selecciona una fecha válida.',
      );
      return;
    }

    setSaving(true);
    setError('');
    try {
      let imageUrl = raffle.imagen_url;
      if (imageFile) imageUrl = await uploadRaffleImage(imageFile);
      const saved = await onSave({
        nombre: name.trim(),
        descripcion: description.trim(),
        imagen_url: imageUrl,
        cantidad_numeros: raffle.cantidad_numeros,
        precio_numero: Number(price),
        fecha_sorteo: drawDate,
      });
      if (saved) onClose();
    } catch (saveError) {
      setError(getUserFriendlyError(saveError, 'No se pudo guardar la rifa.'));
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
          <label className="modal-label">
            <span className="field-label">
              Imagen del premio{' '}
              <span className="label-hint">opcional · JPG, PNG o WEBP</span>
            </span>
            <div className="input-icon">
              <ImagePlus size={18} />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImageFile(file);
                  setImageName(file?.name || '');
                }}
              />
            </div>
            {imageName && <small>{imageName}</small>}
          </label>
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
            <button className="primary-button" disabled={saving || !hasChanges}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
