const knownMessages: Array<[string, string]> = [
  [
    'canceling statement due to statement timeout',
    'La operación tardó demasiado. Intenta de nuevo.',
  ],
  ['statement timeout', 'La operación tardó demasiado. Intenta de nuevo.'],
  ['invalid login credentials', 'El correo o el código no son válidos.'],
  ['invalid otp', 'El código no es válido o ya venció.'],
  ['otp expired', 'El código ya venció. Solicita uno nuevo.'],
  [
    'email rate limit exceeded',
    'Espera un momento antes de solicitar otro código.',
  ],
  ['user already registered', 'Este correo ya está registrado.'],
  ['duplicate key', 'Este registro ya existe.'],
  ['permission denied', 'No tienes permisos para realizar esta acción.'],
  ['row-level security', 'No tienes permisos para realizar esta acción.'],
  [
    'network request failed',
    'No se pudo conectar con el servidor. Revisa tu conexión.',
  ],
  [
    'failed to fetch',
    'No se pudo conectar con el servidor. Revisa tu conexión.',
  ],
];

export function getUserFriendlyError(
  error: unknown,
  fallback = 'No se pudo completar la operación.',
) {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalizedMessage = message.toLowerCase();
  const knownMessage = knownMessages.find(([text]) =>
    normalizedMessage.includes(text),
  );

  return knownMessage?.[1] || fallback;
}
