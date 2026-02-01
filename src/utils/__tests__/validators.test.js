import { describe, expect, it } from 'vitest';
import { isValidAmount, validateRequest } from '../validators';

describe('isValidAmount', () => {
  it('accepts positive numbers', () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(0.01)).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-10)).toBe(false);
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount(null)).toBe(false);
  });
});

describe('validateRequest', () => {
  it('returns valid for correct payload', () => {
    const payload = {
      amount: 100,
      category: 'comida',
      reason: 'Compra de viveres',
    };

    const result = validateRequest(payload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('detects invalid amount', () => {
    const result = validateRequest({
      amount: -50,
      category: 'comida',
      reason: 'Test',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe('Monto invalido');
  });

  it('detects missing category', () => {
    const result = validateRequest({
      amount: 100,
      category: '',
      reason: 'Test valido',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe('Categoria requerida');
  });

  it('detects missing reason', () => {
    const result = validateRequest({
      amount: 100,
      category: 'comida',
      reason: '',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.reason).toBe('Motivo requerido');
  });
});
