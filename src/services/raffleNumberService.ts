import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type { NumberStatus } from '../types/raffle';

export async function updateRaffleNumber(
  id: string,
  status: NumberStatus,
  buyer: string,
) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('numeros')
    .update({
      estado: status,
      comprador_nombre: buyer.trim() || null,
    })
    .eq('id', id);

  if (error) throw error;
}
