import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../../utils/format';

describe('formatCurrency utility', () => {
  it('formats 0 or negative or falsy as "Miễn phí"', () => {
    expect(formatCurrency(0)).toBe('Miễn phí');
    expect(formatCurrency('0')).toBe('Miễn phí');
    expect(formatCurrency(-50000)).toBe('Miễn phí');
    expect(formatCurrency(null)).toBe('Miễn phí');
    expect(formatCurrency(undefined)).toBe('Miễn phí');
    expect(formatCurrency('')).toBe('Miễn phí');
  });

  it('formats positive numbers as formatted VNĐ with ₫ suffix', () => {
    expect(formatCurrency(500000)).toMatch(/500[.,]000\s?₫/);
    expect(formatCurrency(1200000)).toMatch(/1[.,]200[.,]000\s?₫/);
  });
});
