import type { NumberStatus } from '../../types/raffle';
import type { RaffleNumberView } from '../../hooks/useRaffle';

interface NumberTableProps {
  numbers: RaffleNumberView[];
  onSelect: (number: RaffleNumberView) => void;
  onStatusChange: (number: number, status: NumberStatus) => void;
}

export function NumberTable({
  numbers,
  onSelect,
  onStatusChange,
}: NumberTableProps) {
  return (
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
          {numbers.map((item) => (
            <tr key={item.number}>
              <td>#{String(item.number).padStart(2, '0')}</td>
              <td>
                <button className="buyer-link" onClick={() => onSelect(item)}>
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
                    onStatusChange(
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
  );
}
