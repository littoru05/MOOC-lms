import { describe, it, expect, vi, beforeEach } from 'vitest';
import client, { setAccessToken, getAccessToken, API_BASE_URL } from '../../api/client';
import axios from 'axios';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Client API & In-Memory Auth Interceptors', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it('quản lý access token hoàn toàn trong In-Memory', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('test-access-token-123');
    expect(getAccessToken()).toBe('test-access-token-123');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('đính kèm header Authorization từ in-memory token vào request', async () => {
    setAccessToken('in-memory-jwt-token');

    let capturedAuthHeader = null;
    server.use(
      http.get('*/api/v1/test-auth-header', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      })
    );

    const res = await client.get('/api/v1/test-auth-header');
    expect(res.data.ok).toBe(true);
    expect(capturedAuthHeader).toBe('Bearer in-memory-jwt-token');
  });

  it('tự động refresh token và retry request khi gặp lỗi 401', async () => {
    let callCount = 0;
    server.use(
      http.get('*/api/v1/protected-resource', () => {
        callCount++;
        if (callCount === 1) {
          // Lần đầu trả về 401
          return new HttpResponse(null, { status: 401 });
        }
        // Sau khi refresh thành công, retry trả về 200
        return HttpResponse.json({ data: 'secret-content' });
      }),
      http.post('*/api/v1/auth/refresh', () => {
        return HttpResponse.json({
          token: 'new-refreshed-jwt-token',
          id: 3,
          email: 'student@lms.com',
        });
      })
    );

    const res = await client.get('/api/v1/protected-resource');
    expect(res.data.data).toBe('secret-content');
    expect(callCount).toBe(2);
    expect(getAccessToken()).toBe('new-refreshed-jwt-token');
  });

  it('không thử refresh và không lặp vô hạn khi chính request auth trả về 401', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Sai mật khẩu' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );

    await expect(client.post('/api/v1/auth/login', {})).rejects.toThrow();
  });
});
