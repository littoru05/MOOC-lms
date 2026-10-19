import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import { setAccessToken } from '../api/client';

// Bật MSW Mock Server trước khi chạy tất cả các test
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset MSW handlers, in-memory token và xóa sạch dữ liệu localStorage sau mỗi ca test
afterEach(() => {
  server.resetHandlers();
  setAccessToken(null);
  localStorage.clear();
});

// Tắt MSW server khi hoàn tất bộ test
afterAll(() => server.close());
