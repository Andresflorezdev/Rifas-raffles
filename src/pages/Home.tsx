import { AlertTriangle, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { RaffleCard } from '../components/raffles/RaffleCard';
import { useRaffles } from '../hooks/useRaffles';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

export function Home() {
  const navigate = useNavigate();
  const name = sessionStorage.getItem('raffles-name') || 'Creador';
  const { raffles, loading, error, changeStatus, remove } = useRaffles();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const visibleRaffles = raffles.filter((raffle) =>
    raffle.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  const activeRaffles = raffles.filter((raffle) => raffle.status === 'activa');
  const soldNumbers = raffles.reduce((total, raffle) => total + raffle.sold, 0);
  const revenue = raffles.reduce((total, raffle) => total + raffle.revenue, 0);

  const handleDelete = (id: string) => {
    setPendingDelete(id);
  };

  const raffleToDelete = raffles.find((raffle) => raffle.id === pendingDelete);

  return (
    <main className="app-shell">
      <AppHeader />
      <div className="home-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow coral-text">Tu espacio de trabajo</p>
            <h1>
              Hola, {name.split(' ')[0]} <span>✦</span>
            </h1>
            <p className="muted">Aquí tienes el pulso de tus rifas.</p>
          </div>
          <button
            className="primary-button compact"
            onClick={() => navigate('/rifa/nueva')}
          >
            <Plus size={18} /> Nueva rifa
          </button>
        </section>
        <section className="summary-strip">
          <div>
            <span>Rifas activas</span>
            <strong>{activeRaffles.length}</strong>
          </div>
          <div>
            <span>Números vendidos</span>
            <strong>{soldNumbers}</strong>
          </div>
          <div>
            <span>Recaudado</span>
            <strong>{formatCurrency(revenue)}</strong>
          </div>
          <div className="summary-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar una rifa"
            />
          </div>
        </section>
        <div className="section-heading">
          <h2>Tus rifas</h2>
          <span>{activeRaffles.length} activas</span>
        </div>
        {loading && <p className="muted">Cargando tus rifas...</p>}
        {error && (
          <p className="form-error">No se pudieron cargar las rifas: {error}</p>
        )}
        {!loading && !error && visibleRaffles.length === 0 && (
          <p className="muted">
            {search
              ? 'No encontramos rifas con ese nombre.'
              : 'Aún no tienes rifas creadas.'}
          </p>
        )}
        <div className="raffle-grid">
          {visibleRaffles.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onOpen={(id) => navigate(`/rifa/${id}`)}
              onStatusChange={(id, status) => void changeStatus(id, status)}
              onDelete={handleDelete}
            />
          ))}
        </div>
        {!loading && raffles.length === 0 && (
          <button
            className="empty-action"
            onClick={() => navigate('/rifa/nueva')}
          >
            <Plus size={18} /> Crear otra rifa
          </button>
        )}
      </div>
      {raffleToDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPendingDelete(null);
          }}
        >
          <section className="confirm-modal" role="dialog" aria-modal="true">
            <button
              className="icon-button confirm-close"
              onClick={() => setPendingDelete(null)}
              aria-label="Cerrar confirmación"
            >
              <X size={18} />
            </button>
            <div className="confirm-icon">
              <AlertTriangle size={22} />
            </div>
            <p className="eyebrow coral-text">Eliminar rifa</p>
            <h2>¿Eliminar “{raffleToDelete.name}”?</h2>
            <p className="muted">
              Esta acción eliminará la rifa y sus números. No se puede deshacer.
            </p>
            <div className="confirm-actions">
              <button
                className="secondary-button"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="delete-confirm-button"
                onClick={() => {
                  void remove(raffleToDelete.id);
                  setPendingDelete(null);
                }}
              >
                Eliminar rifa
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
