import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import { getUserFriendlyError } from '../lib/errorMessages';

const namePattern = /^[\p{L}\s]+$/u;

export function sanitizePhone(value: string) {
  const allowedCharacters = value.replace(/[^\d+\s()-]/g, '');
  let digitCount = 0;
  return [...allowedCharacters]
    .filter((character) => {
      if (/\d/.test(character)) digitCount += 1;
      return digitCount <= 15;
    })
    .join('');
}

export function useProfile() {
  const [name, setName] = useState(
    sessionStorage.getItem('raffles-name') || '',
  );
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getProfile()
      .then((profile) => {
        if (!active) return;
        if (profile) {
          setName(profile.nombre || '');
          setPhone(sanitizePhone(profile.telefono || ''));
        }
      })
      .catch((profileError) => {
        if (active) {
          setError(
            getUserFriendlyError(
              profileError,
              'No se pudo cargar tu información.',
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNameChange = (rawValue: string) => {
    setName(rawValue.replace(/[^\p{L}\s]/gu, ''));
    if (error) setError('');
  };

  const handlePhoneChange = (rawValue: string) => {
    setPhone(sanitizePhone(rawValue));
    if (error) setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!namePattern.test(name.trim())) {
      setError('El nombre solo puede contener letras y espacios.');
      return;
    }

    setError('');
    try {
      await updateProfile(name, phone);
      sessionStorage.setItem('raffles-name', name.trim());
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (updateError) {
      setError(
        getUserFriendlyError(
          updateError,
          'No se pudieron guardar los cambios.',
        ),
      );
    }
  };

  return {
    name,
    phone,
    saved,
    error,
    loading,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
  };
}
