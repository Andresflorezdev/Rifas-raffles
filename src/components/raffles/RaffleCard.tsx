import { Ticket } from 'lucide-react';
import type { RaffleCardData } from '../../hooks/useRaffles';
import type { RaffleStatus } from '../../types/raffle';

interface RaffleCardProps {
  raffle: RaffleCardData;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: RaffleStatus) => void;
  onDelete: (id: string) => void;
}

export function RaffleCard({
  raffle,
  onOpen,
  onStatusChange,
  onDelete,
}: RaffleCardProps) {
  const progress = raffle.total ? (raffle.sold / raffle.total) * 100 : 0;

  return (
    <article className="raffle-card">
      <div
        className={`raffle-image ${raffle.color}`}
        aria-label={raffle.imageUrl ? `Imagen de ${raffle.name}` : undefined}
      >
        {raffle.imageUrl ? (
          <>
            <div
              className="raffle-image-blur"
              style={{ backgroundImage: `url(${raffle.imageUrl})` }}
              aria-hidden="true"
            />
            <img src={raffle.imageUrl} alt={`Premio de ${raffle.name}`} />
          </>
        ) : (
          <>
            <Ticket size={42} strokeWidth={1.3} />
            <span>RIFA</span>
          </>
        )}
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
        <div className="raffle-actions">
          <select
            value={raffle.status}
            aria-label={`Estado de ${raffle.name}`}
            onChange={(event) =>
              onStatusChange(raffle.id, event.target.value as RaffleStatus)
            }
          >
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
            <option value="archivada">Archivada</option>
          </select>
          <button className="danger-button" onClick={() => onDelete(raffle.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
