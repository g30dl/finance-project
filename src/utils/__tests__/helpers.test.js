import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatCurrency, formatDate, getRelativeTime } from '../helpers';

describe('formatCurrency', () => {
  it('formats numbers without symbol when requested', () => {
    const value = formatCurrency(1000, {
      showSymbol: false,
      locale: 'en-US',
      decimals: 2,
    });

    expect(value).toBe('1,000.00');
  });

  it('returns a string for default options', () => {
    const value = formatCurrency(500);
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });
});

describe('formatDate', () => {
  it('returns empty string for falsy values', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('returns a non-empty string for valid dates', () => {
    const value = formatDate(Date.UTC(2026, 0, 1));
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns seconds message for recent timestamps', () => {
    const now = new Date('2026-02-01T12:00:00Z');
    vi.setSystemTime(now);

    const timestamp = now.getTime() - 30 * 1000;
    expect(getRelativeTime(timestamp)).toBe('Hace unos segundos');
  });

  it('returns days message for older timestamps', () => {
    const now = new Date('2026-02-05T00:00:00Z');
    vi.setSystemTime(now);

    const twoDaysAgo = now.getTime() - 2 * 24 * 60 * 60 * 1000;
    expect(getRelativeTime(twoDaysAgo)).toBe('Hace 2 dias');
  });
});
