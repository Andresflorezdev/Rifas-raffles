import type { Raffle } from '../../types/raffle';
import type { RaffleNumberView } from '../../hooks/useRaffle';

interface RaffleStatsProps {
  raffle: Raffle;
  numbers: RaffleNumberView[];
}

export function RaffleStats({ raffle, numbers }: RaffleStatsProps) {
  const counts = {
    disponible: numbers.filter((item) => item.status === 'disponible').length,
    apartado: numbers.filter((item) => item.status === 'apartado').length,
    pagado: numbers.filter((item) => item.status === 'pagado').length,
  };

  return (
    <section className="stats-grid">
      <div>
        <span>Disponibles</span>
        <strong>{counts.disponible}</strong>
      </div>
      <div>
        <span>Apartados</span>
        <strong className="yellow-text">{counts.apartado}</strong>
      </div>
      <div>
        <span>Pagados</span>
        <strong className="teal-text">{counts.pagado}</strong>
      </div>
      <div>
        <span>Recaudado</span>
        <strong>
          ${(counts.pagado * raffle.precio_numero).toLocaleString('es-CO')}
        </strong>
      </div>
    </section>
  );
}
