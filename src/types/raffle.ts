export type RaffleStatus = 'activa' | 'finalizada' | 'cancelada';
export type NumberStatus = 'disponible' | 'apartado' | 'pagado';

export interface Profile {
  id: string;
  nombre: string;
  telefono: string | null;
  created_at: string;
}

export interface Raffle {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_sorteo: string | null;
  estado: RaffleStatus;
  created_at: string;
}

export interface RaffleNumber {
  id: string;
  rifa_id: string;
  numero: number;
  estado: NumberStatus;
  comprador_nombre: string | null;
  comprador_telefono: string | null;
  notas: string | null;
  fecha_apartado: string | null;
  fecha_pago: string | null;
}
