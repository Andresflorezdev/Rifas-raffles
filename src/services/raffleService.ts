import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type {
  NumberStatus,
  Raffle,
  RaffleNumber,
  RaffleStatus,
} from '../types/raffle';

export interface RaffleSummary extends Raffle {
  numeros: Pick<RaffleNumber, 'estado'>[];
}

export interface RaffleWithNumbers extends Raffle {
  numeros: RaffleNumber[];
}

const RAFFLE_IMAGE_BUCKET = 'rifas-imagenes';

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

export async function updateRaffleStatus(id: string, status: RaffleStatus) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('rifas')
    .update({ estado: status })
    .eq('id', id);
  if (error) throw error;
}

export async function updateRaffle(
  id: string,
  values: Pick<
    Raffle,
    | 'nombre'
    | 'descripcion'
    | 'imagen_url'
    | 'cantidad_numeros'
    | 'precio_numero'
    | 'fecha_sorteo'
  >,
) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('rifas').update(values).eq('id', id);
  if (error) throw error;
}

export async function updateRaffleNotes(id: string, notes: string) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('rifas')
    .update({ notas: notes.trim() || null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteRaffle(id: string) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('rifas').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadRaffleImage(file: File) {
  if (!isSupabaseConfigured) return null;

  if (!file.type.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen válido.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(RAFFLE_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage
    .from(RAFFLE_IMAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function countNumbers(
  numbers: Pick<RaffleNumber, 'estado'>[],
  status: NumberStatus,
) {
  return numbers.filter((number) => number.estado === status).length;
}
