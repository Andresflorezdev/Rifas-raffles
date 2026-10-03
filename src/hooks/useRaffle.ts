import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { updateRaffleNumber } from '../services/raffleNumberService';
import { getRaffle, updateRaffle } from '../services/raffleService';
import type { NumberStatus, Raffle } from '../types/raffle';

export interface RaffleNumberView {
  id: string;
  number: number;
  status: NumberStatus;
  buyer: string;
  notes: string;
}

const demoNumbers: RaffleNumberView[] = Array.from(
  { length: 60 },
  (_, index) => ({
    id: `demo-number-${index + 1}`,
    number: index + 1,
    status: index < 18 ? 'pagado' : index < 29 ? 'apartado' : 'disponible',
    buyer:
      index < 18
        ? ['Laura Martínez', 'Andrés Rojas', 'Camila Gómez'][index % 3]
        : index < 29
          ? 'Por confirmar'
          : '',
    notes: '',
  }),
);

const demoRaffle: Raffle = {
  id: 'demo-cafe',
  user_id: 'demo-user',
  nombre: 'Kit de café de especialidad',
  descripcion: null,
  notas: null,
  imagen_url: null,
  cantidad_numeros: 100,
  precio_numero: 15000,
  fecha_sorteo: '2026-10-28',
  estado: 'activa',
  created_at: '2026-01-01T00:00:00.000Z',
};

export function useRaffle(raffleId?: string) {
  const [raffle, setRaffle] = useState<Raffle | null>(
    isSupabaseConfigured ? null : demoRaffle,
  );
  const [numbers, setNumbers] = useState<RaffleNumberView[]>(
    isSupabaseConfigured ? [] : demoNumbers,
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !raffleId) return;

    void getRaffle(raffleId)
      .then((item) => {
        setRaffle(item);
        setNumbers(
          item.numeros
            .map((number) => ({
              id: number.id,
              number:
                number.numero === 0 ? item.cantidad_numeros : number.numero,
              status: number.estado,
              buyer: number.comprador_nombre || '',
              notes: number.notas || '',
            }))
            .sort((first, second) => first.number - second.number),
        );
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [raffleId]);

  const updateStatus = async (number: number, status: NumberStatus) => {
    if (raffle?.estado !== 'activa') {
      setError('Esta rifa está cerrada y sus números no se pueden modificar.');
      return false;
    }
    const currentNumber = numbers.find((item) => item.number === number);
    if (!currentNumber) return false;

    setSaving(true);
    setError('');
    try {
      await updateRaffleNumber(
        currentNumber.id,
        status,
        currentNumber.buyer,
        currentNumber.notes,
      );
      setNumbers((current) =>
        current.map((item) =>
          item.number === number ? { ...item, status } : item,
        ),
      );
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudo guardar el número.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateNumber = async (
    number: number,
    status: NumberStatus,
    buyer: string,
    notes: string,
  ) => {
    if (raffle?.estado !== 'activa') {
      setError('Esta rifa está cerrada y sus números no se pueden modificar.');
      return false;
    }
    const currentNumber = numbers.find((item) => item.number === number);
    if (!currentNumber) return false;

    setSaving(true);
    setError('');
    try {
      await updateRaffleNumber(currentNumber.id, status, buyer, notes);
      setNumbers((current) =>
        current.map((item) =>
          item.number === number
            ? { ...item, status, buyer: buyer.trim(), notes: notes.trim() }
            : item,
        ),
      );
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudo guardar el número.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const editRaffle = async (values: Parameters<typeof updateRaffle>[1]) => {
    if (!raffle || raffle.estado !== 'activa') {
      setError('Esta rifa está cerrada y no se puede modificar.');
      return false;
    }

    setSaving(true);
    setError('');
    try {
      await updateRaffle(raffle.id, values);
      setRaffle((current) => (current ? { ...current, ...values } : current));
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudo actualizar la rifa.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    raffle,
    numbers,
    loading,
    error,
    saving,
    updateStatus,
    updateNumber,
    editRaffle,
  };
}
