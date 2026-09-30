import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type { NumberStatus, Raffle, RaffleNumber } from '../types/raffle';

export interface RaffleSummary extends Raffle {
  numeros: Pick<RaffleNumber, 'estado'>[];
}

export interface RaffleWithNumbers extends Raffle {
  numeros: RaffleNumber[];
}

export async function listRaffles(): Promise<RaffleSummary[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('rifas')
    .select('*, numeros(estado)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RaffleSummary[];
}

export async function getRaffle(id: string): Promise<RaffleWithNumbers> {
  const { data, error } = await supabase
    .from('rifas')
    .select('*, numeros(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as RaffleWithNumbers;
}

export function countNumbers(
  numbers: Pick<RaffleNumber, 'estado'>[],
  status: NumberStatus,
) {
  return numbers.filter((number) => number.estado === status).length;
}
