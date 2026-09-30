import { Ticket } from 'lucide-react';
import type { RaffleCardData } from '../../hooks/useRaffles';

interface RaffleCardProps {
  raffle: RaffleCardData;
  onOpen: (id: string) => void;
}

export function RaffleCard({ raffle, onOpen }: RaffleCardProps) {
  const progress = raffle.total ? (raffle.sold / raffle.total) * 100 : 0;

  return (
    <article className="raffle-card">
      <div
        className={`raffle-image ${raffle.color}`}
        style={
          raffle.imageUrl
            ? { backgroundImage: `url(${raffle.imageUrl})` }
            : undefined
        }
      >
        {!raffle.imageUrl && <Ticket size={42} strokeWidth={1.3} />}
        <span>RIFA</span>
      </div>
      <div className="raffle-card-body">
        <div className="card-title-row">
          <h3>{raffle.name}</h3>
          <span className="status-pill">{raffle.status}</span>
        </div>
        <p className="muted small">{raffle.detail}</p>
        <div className="progress-meta">
          <span>
            {raffle.sold}/{raffle.total} vendidos
          </span>
          <strong>{Math.round(progress)}%</strong>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="card-footer">
          <span>{raffle.date}</span>
          <button onClick={() => onOpen(raffle.id)}>
            Ver detalle <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
