import { Plus, Search, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';

const demoRaffles = [
  {
    name: 'Kit de café de especialidad',
    detail: '100 números · $15.000 c/u',
    sold: 68,
    color: 'coral',
    date: 'Sorteo · 28 oct 2026',
  },
  {
    name: 'Bicicleta urbana',
    detail: '200 números · $10.000 c/u',
    sold: 124,
    color: 'teal',
    date: 'Sorteo · 14 nov 2026',
  },
];

export function Home() {
  const navigate = useNavigate();
  const name = sessionStorage.getItem('raffles-name') || 'Creador';

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
            <strong>2</strong>
          </div>
          <div>
            <span>Números vendidos</span>
            <strong>192</strong>
          </div>
          <div>
            <span>Recaudado</span>
            <strong>$2.260.000</strong>
          </div>
          <div className="summary-search">
            <Search size={18} />
            <input placeholder="Buscar una rifa" />
          </div>
        </section>
        <div className="section-heading">
          <h2>Tus rifas</h2>
          <span>2 activas</span>
        </div>
        <div className="raffle-grid">
          {demoRaffles.map((raffle) => (
            <article className="raffle-card" key={raffle.name}>
              <div className={`raffle-image ${raffle.color}`}>
                <Ticket size={42} strokeWidth={1.3} />
                <span>RIFA</span>
              </div>
              <div className="raffle-card-body">
                <div className="card-title-row">
                  <h3>{raffle.name}</h3>
                  <span className="status-pill">Activa</span>
                </div>
                <p className="muted small">{raffle.detail}</p>
                <div className="progress-meta">
                  <span>{raffle.sold}/100 vendidos</span>
                  <strong>{raffle.sold}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${raffle.sold}%` }} />
                </div>
                <div className="card-footer">
                  <span>{raffle.date}</span>
                  <button onClick={() => navigate('/rifa/demo')}>
                    Ver detalle <span>→</span>
                  </button>
                </div>
              </div>
            </article>
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
