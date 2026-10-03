import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  countNumbers,
  deleteRaffle,
  listRaffles,
  updateRaffleStatus,
} from '../services/raffleService';
import type { RaffleStatus } from '../types/raffle';

export interface RaffleCardData {
  id: string;
  name: string;
  detail: string;
  sold: number;
  total: number;
  revenue: number;
  color: 'coral' | 'teal';
  date: string;
  status: RaffleStatus;
  imageUrl: string | null;
}

const demoRaffles: RaffleCardData[] = [
  {
    id: 'demo-cafe',
    name: 'Kit de café de especialidad',
    detail: '100 números · $15.000 c/u',
    sold: 68,
    total: 100,
    revenue: 1020000,
    color: 'coral',
    date: 'Sorteo · 28 oct 2026',
    status: 'activa',
    imageUrl: null,
  },
  {
    id: 'demo-bici',
    name: 'Bicicleta urbana',
    detail: '200 números · $10.000 c/u',
    sold: 124,
    total: 200,
    revenue: 1240000,
    color: 'teal',
    date: 'Sorteo · 14 nov 2026',
    status: 'activa',
    imageUrl: null,
  },
];

function formatDate(value: string | null) {
  if (!value) return 'Sorteo sin fecha';
  return `Sorteo · ${new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))}`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

export function useRaffles() {
  const [raffles, setRaffles] = useState<RaffleCardData[]>(
    isSupabaseConfigured ? [] : demoRaffles,
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    void listRaffles()
      .then((items) => {
        setRaffles(
          items.map((raffle, index) => {
            const sold = countNumbers(raffle.numeros, 'pagado');
            return {
              id: raffle.id,
              name: raffle.nombre,
              detail: `${raffle.cantidad_numeros} números · ${formatCurrency(raffle.precio_numero)} c/u`,
              sold,
              total: raffle.cantidad_numeros,
              revenue: sold * raffle.precio_numero,
              color: index % 2 === 0 ? 'coral' : 'teal',
              date: formatDate(raffle.fecha_sorteo),
              status: raffle.estado,
              imageUrl: raffle.imagen_url,
            };
          }),
        );
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: RaffleStatus) => {
    setError('');
    try {
      await updateRaffleStatus(id, status);
      setRaffles((current) =>
        current.map((raffle) =>
          raffle.id === id ? { ...raffle, status } : raffle,
        ),
      );
    } catch (statusError) {
      setError(
        getUserFriendlyError(statusError, 'No se pudo actualizar la rifa.'),
      );
    }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await deleteRaffle(id);
      setRaffles((current) => current.filter((raffle) => raffle.id !== id));
    } catch (deleteError) {
      setError(
        getUserFriendlyError(deleteError, 'No se pudo eliminar la rifa.'),
      );
    }
  };

  return { raffles, loading, error, changeStatus, remove };
}
