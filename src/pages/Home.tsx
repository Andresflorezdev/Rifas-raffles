import { Plus, Search } from 'lucide-react';
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
  const { raffles, loading, error } = useRaffles();
  const [search, setSearch] = useState('');

  const visibleRaffles = raffles.filter((raffle) =>
    raffle.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  const activeRaffles = raffles.filter((raffle) => raffle.status === 'activa');
  const soldNumbers = raffles.reduce((total, raffle) => total + raffle.sold, 0);
  const revenue = raffles.reduce((total, raffle) => total + raffle.revenue, 0);

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
            />
          ))}
        </div>
        <button
          className="empty-action"
          onClick={() => navigate('/rifa/nueva')}
        >
          <Plus size={18} /> Crear otra rifa
        </button>
      </div>
    </main>
  );
}
