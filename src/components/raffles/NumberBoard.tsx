import { Check } from 'lucide-react';
import type { RaffleNumberView } from '../../hooks/useRaffle';

interface NumberBoardProps {
  numbers: RaffleNumberView[];
  onSelect: (number: RaffleNumberView) => void;
}

export function NumberBoard({ numbers, onSelect }: NumberBoardProps) {
  return (
    <div className="number-board">
      {numbers.map((item) => (
        <button
          key={item.number}
          className={`number-cell ${item.status}`}
          onClick={() => onSelect(item)}
          title={`Editar número ${item.number}`}
        >
          <span>{String(item.number).padStart(2, '0')}</span>
          {item.status === 'pagado' && <Check size={13} />}
        </button>
      ))}
    </div>
  );
}
