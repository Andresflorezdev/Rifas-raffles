import { useState } from 'react';
import type { FormEvent } from 'react';
import type { NumberStatus } from '../types/raffle';
import type { RaffleNumberView } from './useRaffle';

const buyerNamePattern = /^[\p{L}\s]+$/u;

export const NUMBER_STATUSES: NumberStatus[] = [
  'disponible',
  'apartado',
  'pagado',
];

interface UseNumberEditorOptions {
  number: RaffleNumberView;
  onSave: (
    status: NumberStatus,
    buyer: string,
    notes: string,
  ) => Promise<boolean>;
}

export function useNumberEditor({ number, onSave }: UseNumberEditorOptions) {
  const [status, setStatus] = useState<NumberStatus>(number.status);
  const [buyer, setBuyer] = useState(number.buyer);
  const [notes, setNotes] = useState(number.notes);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isBuyerRequired = status === 'apartado' || status === 'pagado';

  const handleStatusChange = (newStatus: NumberStatus) => {
    setStatus(newStatus);
    if (newStatus === 'disponible' && error) {
      setError('');
    }
  };

  const handleBuyerChange = (rawValue: string) => {
    const sanitized = rawValue.replace(/[^\p{L}\s]/gu, '');
    setBuyer(sanitized);
    if (error) setError('');
  };

  const handleSubmit = async (event?: FormEvent) => {
    if (event) event.preventDefault();

    if (isBuyerRequired && !buyer.trim()) {
      setError(
        'Ingresa el nombre de la persona para apartar o comprar este número.',
      );
      return;
    }

    if (buyer.trim() && !buyerNamePattern.test(buyer.trim())) {
      setError('El nombre solo puede contener letras y espacios.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const finalBuyer =
        status === 'disponible' && !buyer.trim() ? '' : buyer.trim();
      await onSave(status, finalBuyer, notes.trim());
    } finally {
      setSaving(false);
    }
  };

  return {
    status,
    buyer,
    notes,
    error,
    saving,
    isBuyerRequired,
    handleStatusChange,
    handleBuyerChange,
    setNotes,
    handleSubmit,
  };
}
