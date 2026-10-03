import { CalendarDays, ImagePlus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { AppHeader } from '../components/AppHeader';
import { getUserFriendlyError } from '../lib/errorMessages';

export function RaffleForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('15000');
  const [drawDate, setDrawDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || Number(quantity) < 1 || Number(price) < 0) {
      setError('Completa el nombre, la cantidad y el precio.');
      return;
    }
    setError('');
    setSaving(true);
    if (isSupabaseConfigured) {
      const { error: insertError } = await supabase.from('rifas').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        nombre: name.trim(),
        descripcion: description.trim() || null,
        imagen_url: imageUrl.trim() || null,
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
    navigate('/');
  };

  return (
    <main className="app-shell form-page">
      <AppHeader backLabel="Volver al panel" />
      <div className="form-content">
        <p className="eyebrow coral-text">Nueva rifa</p>
        <h1>Crea una rifa atractiva en minutos.</h1>
        <p className="muted">
          Define el premio, el valor de cada número y la fecha del sorteo.
        </p>
        <form className="raffle-form" onSubmit={handleSubmit}>
          <label>
            Nombre de la rifa
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. PlayStation 5 + 2 juegos"
            />
          </label>
          <label>
            Descripción del premio
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Incluye detalles del premio, condiciones o método de entrega..."
            />
          </label>
          <label>
            Imagen del premio <span className="label-hint">opcional</span>
            <div className="input-icon">
              <ImagePlus size={18} />
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </label>
          <div className="form-grid">
            <label>
              Cantidad de números
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label>
              Precio por número
              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </label>
          </div>
          <label>
            Fecha del sorteo <span className="label-hint">opcional</span>
            <div className="input-icon">
              <CalendarDays size={18} />
              <input
                type="date"
                value={drawDate}
                onChange={(event) => setDrawDate(event.target.value)}
              />
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={saving}>
            <Sparkles size={18} />
            {saving ? 'Creando rifa...' : 'Publicar rifa'}
          </button>
        </form>
      </div>
    </main>
  );
}
