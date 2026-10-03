import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/raffle';

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  nombre: string,
  telefono: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Debes iniciar sesión para actualizar tu perfil.');
  }

  const { error } = await supabase
    .from('perfiles')
    .update({ nombre: nombre.trim(), telefono: telefono?.trim() || null })
    .eq('id', userData.user.id);

  if (error) throw error;
}
