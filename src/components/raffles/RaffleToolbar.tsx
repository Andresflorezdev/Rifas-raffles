import { Grid3X3, List } from 'lucide-react';
import type { NumberStatus } from '../../types/raffle';

export type RaffleView = 'board' | 'table';
export type NumberFilter = 'todos' | NumberStatus;

interface RaffleToolbarProps {
  view: RaffleView;
  filter: NumberFilter;
  onViewChange: (view: RaffleView) => void;
  onFilterChange: (filter: NumberFilter) => void;
}

export function RaffleToolbar({
  view,
  filter,
  onViewChange,
  onFilterChange,
}: RaffleToolbarProps) {
  return (
    <div className="detail-toolbar">
      <div className="view-toggle">
        <button
          className={view === 'board' ? 'selected' : ''}
          onClick={() => onViewChange('board')}
        >
          <Grid3X3 size={16} /> Tablero
        </button>
        <button
          className={view === 'table' ? 'selected' : ''}
          onClick={() => onViewChange('table')}
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
              onClick={() => onFilterChange(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
