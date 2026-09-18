import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { OrderSuccessPage } from '../../pages/student/OrderSuccessPage';

describe('OrderSuccessPage Component', () => {
  it('hiển thị thông tin đơn hàng thành công khi có state', () => {
    const mockOrder = {
      id: 1,
      orderCode: 'ORD-TEST999',
      totalAmount: 500000,
      createdAt: '2026-09-11T08:00:00',
      items: [
        {
          id: 10,
          courseId: 5,
          courseTitle: 'Khóa học Spring Boot Nâng cao',
          price: 500000,
          courseThumbnailUrl: null,
        },
      ],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/orders/success', state: { order: mockOrder } }]}>
        <OrderSuccessPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Thanh toán đơn hàng thành công!')).toBeInTheDocument();
    expect(screen.getByText('ORD-TEST999')).toBeInTheDocument();
    expect(screen.getByText('Khóa học Spring Boot Nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Vào học ngay')).toBeInTheDocument();
    expect(screen.getByText('Đã thanh toán qua QR (Demo)')).toBeInTheDocument();
  });

  it('hiển thị nhãn thanh toán qua thẻ khi order.paymentMethod là CARD', () => {
    const mockOrder = {
      id: 2,
      orderCode: 'ORD-CARD123',
      totalAmount: 300000,
      paymentMethod: 'CARD',
      createdAt: '2026-09-11T08:00:00',
      items: [
        {
          id: 11,
          courseId: 3,
          courseTitle: 'React & Vite Masterclass',
          price: 300000,
          courseThumbnailUrl: null,
        },
      ],
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/orders/success', state: { order: mockOrder } }]}>
        <OrderSuccessPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Đã thanh toán qua Thẻ (Demo)')).toBeInTheDocument();
  });
});
