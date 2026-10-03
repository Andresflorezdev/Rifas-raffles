import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Raffle } from '../types/raffle';
import { uploadRaffleImage } from '../services/raffleService';
import { getUserFriendlyError } from '../lib/errorMessages';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface UseRaffleEditOptions {
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

export function useRaffleEdit({ raffle, onClose, onSave }: UseRaffleEditOptions) {
  const today = formatLocalDate(new Date());

  const [name, setName] = useState(raffle.nombre);
  const [description, setDescription] = useState(raffle.descripcion || '');
  const [price, setPrice] = useState(String(raffle.precio_numero));
  const [drawDate, setDrawDate] = useState(raffle.fecha_sorteo || '');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    raffle.imagen_url || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (file: File | null, clearedCurrent?: boolean) => {
    setImageFile(file);
    if (clearedCurrent) {
      setCurrentImageUrl(null);
    }
  };

  const hasChanges =
    name.trim() !== raffle.nombre ||
    description.trim() !== (raffle.descripcion || '') ||
    price !== String(raffle.precio_numero) ||
    drawDate !== (raffle.fecha_sorteo || '') ||
    imageFile !== null ||
    currentImageUrl !== (raffle.imagen_url || null);

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
      let imageUrl = currentImageUrl;
      if (imageFile) {
        imageUrl = await uploadRaffleImage(imageFile);
      }
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

  return {
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
  };
}
