import { Pencil, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { NumberBoard } from '../components/raffles/NumberBoard';
import { NumberEditorModal } from '../components/raffles/NumberEditorModal';
import { NumberTable } from '../components/raffles/NumberTable';
import {
  type NumberFilter,
  RaffleToolbar,
  type RaffleView,
} from '../components/raffles/RaffleToolbar';
import { RaffleStats } from '../components/raffles/RaffleStats';
import { RaffleEditModal } from '../components/raffles/RaffleEditModal';
import { useRaffle } from '../hooks/useRaffle';
import type { NumberStatus } from '../types/raffle';

function formatDate(value: string | null) {
  if (!value) return 'Sorteo sin fecha';
  return `Sorteo · ${new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))}`;
}

export function RaffleDetail() {
  const { raffleId } = useParams();
  const {
    raffle,
    numbers,
    loading,
    error,
    updateStatus,
    updateNumber,
    editRaffle,
  } = useRaffle(raffleId);
  const [view, setView] = useState<RaffleView>('board');
  const [filter, setFilter] = useState<NumberFilter>('todos');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [editingRaffle, setEditingRaffle] = useState(false);

  const visibleNumbers =
    filter === 'todos'
      ? numbers
      : numbers.filter((item) => item.status === filter);
  const selectedItem = numbers.find((item) => item.number === selectedNumber);
  const isEditable = raffle?.estado === 'activa';

  if (loading) {
    return <div className="loading-screen">Cargando tu rifa...</div>;
  }

  if (!raffle) {
    return (
      <main className="app-shell detail-page">
        <AppHeader backLabel="Volver a mis rifas" />
        <div className="detail-content">
          <p className="form-error">{error || 'No encontramos esta rifa.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell detail-page">
      <AppHeader backLabel="Volver a mis rifas" />
      <div className="detail-content">
        <div className="detail-heading">
          <div>
            <p className="eyebrow coral-text">Detalle de rifa</p>
            <h1>{raffle.nombre}</h1>
            <p className="muted">
              {formatDate(raffle.fecha_sorteo)} · $
              {raffle.precio_numero.toLocaleString('es-CO')} por número
            </p>
          </div>
          <button
            className="secondary-button"
            disabled={!isEditable}
            onClick={() => setEditingRaffle(true)}
            title={isEditable ? 'Editar rifa' : 'La rifa está cerrada'}
          >
            {isEditable ? <Pencil size={16} /> : <LockKeyhole size={16} />}
            {isEditable ? 'Editar rifa' : 'Rifa cerrada'}
          </button>
        </div>
        <RaffleStats raffle={raffle} numbers={numbers} />
        {error && <p className="form-error">{error}</p>}
        <RaffleToolbar
          view={view}
          filter={filter}
          onViewChange={setView}
          onFilterChange={setFilter}
        />
        {view === 'board' ? (
          <NumberBoard
            numbers={visibleNumbers}
            onSelect={(item) => setSelectedNumber(item.number)}
          />
        ) : (
          <NumberTable
            numbers={visibleNumbers}
            onSelect={(item) => setSelectedNumber(item.number)}
            onStatusChange={updateStatus}
          />
        )}
      </div>
      {selectedItem && (
        <NumberEditorModal
          number={selectedItem}
          onClose={() => setSelectedNumber(null)}
          onSave={async (status: NumberStatus, buyer: string) => {
            const updated = await updateNumber(
              selectedItem.number,
              status,
              buyer,
            );
            if (updated) setSelectedNumber(null);
            return updated;
          }}
        />
      )}
      {editingRaffle && isEditable && (
        <RaffleEditModal
          raffle={raffle}
          onClose={() => setEditingRaffle(false)}
          onSave={editRaffle}
        />
      )}
    </main>
  );
}
