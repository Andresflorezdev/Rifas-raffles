import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRaffle, uploadRaffleImage } from '../services/raffleService';
import { getUserFriendlyError } from '../lib/errorMessages';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useRaffleForm() {
  const navigate = useNavigate();
  const today = formatLocalDate(new Date());

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('15000');
  const [drawDate, setDrawDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadRaffleImage(imageFile);
      }

      await createRaffle({
        nombre: name,
        descripcion: description,
        imagen_url: imageUrl,
        cantidad_numeros: Number(quantity),
        precio_numero: Number(price),
        fecha_sorteo: drawDate,
      });

      navigate('/inicio');
    } catch (submitError) {
      setError(
        getUserFriendlyError(submitError, 'No se pudo crear la rifa.'),
      );
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
