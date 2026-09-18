import { describe, it, expect } from 'vitest';
import { getImageUrl } from '../../utils/imageUrl';

describe('getImageUrl utility', () => {
  it('returns fallback when path is falsy', () => {
    expect(getImageUrl('', 'fallback.jpg')).toBe('fallback.jpg');
    expect(getImageUrl(null, 'default.png')).toBe('default.png');
    expect(getImageUrl(undefined)).toBe('');
  });

  it('keeps absolute URLs, blob URLs and data URLs intact', () => {
    expect(getImageUrl('https://images.unsplash.com/photo-123')).toBe('https://images.unsplash.com/photo-123');
    expect(getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    expect(getImageUrl('blob:http://localhost:5173/abc-123')).toBe('blob:http://localhost:5173/abc-123');
    expect(getImageUrl('data:image/png;base64,iVBORw...')).toBe('data:image/png;base64,iVBORw...');
  });

  it('prepends API_BASE_URL to internal /api paths', () => {
    const res = getImageUrl('/api/v1/files/my-avatar.png');
    expect(res).toContain('/api/v1/files/my-avatar.png');
    expect(res.startsWith('http://') || res.startsWith('https://')).toBe(true);
  });
});
