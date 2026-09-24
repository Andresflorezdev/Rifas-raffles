import { Check, Grid3X3, List, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { NumberStatus } from '../types/raffle';
import { AppHeader } from '../components/AppHeader';

type DemoNumber = { number: number; status: NumberStatus; buyer: string };

const initialNumbers: DemoNumber[] = Array.from({ length: 60 }, (_, index) => ({
  number: index + 1,
  status: index < 18 ? 'pagado' : index < 29 ? 'apartado' : 'disponible',
  buyer:
    index < 18
      ? ['Laura Martínez', 'Andrés Rojas', 'Camila Gómez'][index % 3]
      : index < 29
        ? 'Por confirmar'
        : '',
}));

export function RaffleDetail() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [numbers, setNumbers] = useState(initialNumbers);
  const [filter, setFilter] = useState<'todos' | NumberStatus>('todos');
  const [selectedNumber, setSelectedNumber] = useState<DemoNumber | null>(null);
  const [draftStatus, setDraftStatus] = useState<NumberStatus>('disponible');
  const [draftBuyer, setDraftBuyer] = useState('');

  const updateStatus = (number: number, status: NumberStatus) => {
    setNumbers((current) =>
      current.map((item) =>
        item.number === number ? { ...item, status } : item,
      ),
    );
  };
  const openNumberEditor = (item: DemoNumber) => {
    setSelectedNumber(item);
    setDraftStatus(item.status);
    setDraftBuyer(item.buyer);
  };
  const saveNumber = () => {
    if (!selectedNumber) return;
    setNumbers((current) =>
      current.map((item) =>
        item.number === selectedNumber.number
          ? { ...item, status: draftStatus, buyer: draftBuyer.trim() }
          : item,
      ),
    );
    setSelectedNumber(null);
  };
  const counts = {
    disponible: numbers.filter((item) => item.status === 'disponible').length,
    apartado: numbers.filter((item) => item.status === 'apartado').length,
    pagado: numbers.filter((item) => item.status === 'pagado').length,
  };
  const visibleNumbers =
    filter === 'todos'
      ? numbers
      : numbers.filter((item) => item.status === filter);

  return (
    <main className="app-shell detail-page">
      <AppHeader backLabel="Volver a mis rifas" />
      <div className="detail-content">
        <div className="detail-heading">
          <div>
            <p className="eyebrow coral-text">Detalle de rifa</p>
            <h1>Kit de café de especialidad</h1>
            <p className="muted">Sorteo · 28 oct 2026 · $15.000 por número</p>
          </div>
          <button className="secondary-button">
            <Save size={16} /> Exportar
          </button>
        </div>
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
            <strong>${(counts.pagado * 15000).toLocaleString('es-CO')}</strong>
          </div>
        </section>
        <div className="detail-toolbar">
          <div className="view-toggle">
            <button
              className={view === 'board' ? 'selected' : ''}
              onClick={() => setView('board')}
            >
              <Grid3X3 size={16} /> Tablero
            </button>
            <button
              className={view === 'table' ? 'selected' : ''}
              onClick={() => setView('table')}
            >
              <List size={16} /> Tabla
            </button>
          </div>
          <div className="filter-buttons">
            {(['todos', 'disponible', 'apartado', 'pagado'] as const).map(
              (item) => (
                <button
                  key={item}
                  className={filter === item ? 'selected' : ''}
                  onClick={() => setFilter(item)}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
        {view === 'board' ? (
          <div className="number-board">
            {visibleNumbers.map((item) => (
              <button
                key={item.number}
                className={`number-cell ${item.status}`}
                onClick={() => openNumberEditor(item)}
                title={`Editar número ${item.number}`}
              >
                <span>{String(item.number).padStart(2, '0')}</span>
                {item.status === 'pagado' && <Check size={13} />}
              </button>
            ))}
          </div>
        ) : (
          <div className="number-table-wrap">
            <table className="number-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Comprador</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {visibleNumbers.map((item) => (
                  <tr key={item.number}>
                    <td>#{String(item.number).padStart(2, '0')}</td>
                    <td>
                      <button
                        className="buyer-link"
                        onClick={() => openNumberEditor(item)}
                      >
                        {item.buyer || 'Sin comprador'}
                      </button>
                    </td>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(
                            item.number,
                            event.target.value as NumberStatus,
                          )
                        }
                      >
                        <option value="disponible">Disponible</option>
                        <option value="apartado">Apartado</option>
                        <option value="pagado">Pagado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedNumber && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedNumber(null);
          }}
        >
          <section
            className="number-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="number-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow coral-text">Editar número</p>
                <h2 id="number-modal-title">
                  Número #{String(selectedNumber.number).padStart(2, '0')}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedNumber(null)}
                aria-label="Cerrar"
              >
                <X size={19} />
              </button>
            </div>
            <p className="muted modal-description">
              Elige el estado de este número y registra los datos del comprador.
            </p>
            <fieldset className="status-options">
              <legend>Estado de la compra</legend>
              {(['disponible', 'apartado', 'pagado'] as const).map((status) => (
                <label
                  key={status}
                  className={`status-option ${draftStatus === status ? 'chosen' : ''}`}
                >
                  <input
                    type="radio"
                    name="number-status"
                    value={status}
                    checked={draftStatus === status}
                    onChange={() => setDraftStatus(status)}
                  />
                  <span className={`status-dot ${status}`} />
                  <span>
                    <strong>{status[0].toUpperCase() + status.slice(1)}</strong>
                    <small>
                      {status === 'disponible'
                        ? 'Nadie lo ha reservado'
                        : status === 'apartado'
                          ? 'El comprador aún debe pagar'
                          : 'Pago confirmado'}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="modal-label">
              Nombre del comprador
              <input
                value={draftBuyer}
                onChange={(event) => setDraftBuyer(event.target.value)}
                placeholder="Ej. Camila Rojas"
              />
            </label>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedNumber(null)}
              >
                Cancelar
              </button>
              <button className="primary-button" onClick={saveNumber}>
                <Save size={16} /> Guardar cambios
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
