export const isValidAmount = (value) => {
  const number = Number(value);
  return !Number.isNaN(number) && number > 0;
};

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const validateRequest = (payload) => {
  const errors = {};

  if (!isValidAmount(payload?.amount)) {
    errors.amount = 'Monto invalido';
  }

  if (!isNonEmptyString(payload?.category)) {
    errors.category = 'Categoria requerida';
  }

  if (!isNonEmptyString(payload?.reason)) {
    errors.reason = 'Motivo requerido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
