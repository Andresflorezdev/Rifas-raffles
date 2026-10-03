import { CalendarDays, ImagePlus, Save } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { uploadRaffleImage } from '../services/raffleService';
import { AppHeader } from '../components/AppHeader';
import { getUserFriendlyError } from '../lib/errorMessages';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RaffleForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('15000');
  const [drawDate, setDrawDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = formatLocalDate(new Date());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !name.trim() ||
      !description.trim() ||
      !quantity ||
      Number(quantity) < 1 ||
      !price ||
      Number(price) < 0 ||
      !drawDate ||
      drawDate < today
    ) {
      setError(
        'Completa todos los campos obligatorios y selecciona una fecha válida.',
      );
      return;
    }
    setError('');
    setSaving(true);
    if (isSupabaseConfigured) {
      let imageUrl: string | null = null;
      if (imageFile) {
        try {
          imageUrl = await uploadRaffleImage(imageFile);
        } catch (uploadError) {
          setError(
            getUserFriendlyError(uploadError, 'No se pudo subir la imagen.'),
          );
          setSaving(false);
          return;
        }
      }
      const { error: insertError } = await supabase.from('rifas').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        nombre: name.trim(),
        descripcion: description.trim() || null,
        imagen_url: imageUrl,
        cantidad_numeros: Number(quantity),
        precio_numero: Number(price),
        fecha_sorteo: drawDate || null,
        estado: 'activa',
      });
      if (insertError) {
        setError(
          getUserFriendlyError(insertError, 'No se pudo crear la rifa.'),
        );
        setSaving(false);
        return;
      }
    }
    navigate('/inicio');
  };

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
          <label>
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
            {imageName && <span className="file-name">{imageName}</span>}
          </label>
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
