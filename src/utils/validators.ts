export const PHONE_DIGITS = 10;
export const COUNTRY_CODE = '58';

export const sanitizePhone = (value: string): string => {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
};

export const getNationalPhoneDigits = (phone: string): string => {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

interface ValidatePhoneOptions {
  required?: boolean;
}

export const validatePhone = (
  phone: string,
  { required = false }: ValidatePhoneOptions = {}
): string | null => {
  const value = (phone || '').trim();

  if (!value) {
    return required ? 'El teléfono es obligatorio' : null;
  }

  const nationalDigits = getNationalPhoneDigits(value);

  if (nationalDigits.length !== PHONE_DIGITS) {
    return `El teléfono debe tener exactamente ${PHONE_DIGITS} dígitos (ej: 4121234567)`;
  }

  return null;
};
