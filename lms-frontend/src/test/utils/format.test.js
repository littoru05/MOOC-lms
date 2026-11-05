import { describe, it, expect } from 'vitest';
import { formatCurrency, formatTimeAgo } from '../../utils/format';

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

describe('formatTimeAgo utility', () => {
  it('returns empty string for null or empty dates', () => {
    expect(formatTimeAgo(null)).toBe('');
    expect(formatTimeAgo('')).toBe('');
    expect(formatTimeAgo(undefined)).toBe('');
  });

  it('returns "Vừa xong" for timestamps less than 1 minute ago', () => {
    const now = new Date();
    expect(formatTimeAgo(now)).toBe('Vừa xong');
  });

  it('returns relative minutes, hours, days correctly', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    expect(formatTimeAgo(tenMinutesAgo)).toBe('10 phút trước');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe('2 giờ trước');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(threeDaysAgo)).toBe('3 ngày trước');
  });
});
