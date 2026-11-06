import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCertificatesPage } from '../../pages/admin/AdminCertificatesPage';
import { renderWithAllProviders } from '../test-utils';
import { resetMockAdminCertificates } from '../mocks/handlers';
import * as AuthContextModule from '../../context/AuthContext';
import * as ToastContextModule from '../../context/ToastContext';

describe('AdminCertificatesPage', () => {
  const mockUser = {
    id: 1,
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin@lms.com',
    role: 'ADMIN',
  };

  const mockToast = {
    showToast: vi.fn(),
    confirm: vi.fn(({ onConfirm }) => onConfirm && onConfirm()),
  };

  beforeEach(() => {
    resetMockAdminCertificates();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isAdmin: true,
      isInstructor: false,
    });
    vi.spyOn(ToastContextModule, 'useToast').mockReturnValue(mockToast);
  });

  it('renders page header, 3 summary cards and certificates table', async () => {
    renderWithAllProviders(<AdminCertificatesPage />);

    expect(screen.getByText(/Quản lý Chứng chỉ số/i)).toBeInTheDocument();
    expect(screen.getByText(/Tổng số chứng chỉ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Còn hiệu lực \(Hợp lệ\)/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Đã thu hồi \(Vô hiệu hóa\)/i)).toBeInTheDocument();

    // Verify certificates from mock
    expect(await screen.findByText('CERT-A1B2C3D4-10001')).toBeInTheDocument();
    expect(screen.getByText('CERT-E5F6G7H8-10002')).toBeInTheDocument();
    expect(screen.getByText('Học viên Nguyễn Văn B')).toBeInTheDocument();
    expect(screen.getByText('Học viên Trần Thị C')).toBeInTheDocument();

    // Verify badges
    expect(screen.getByText('Còn hiệu lực')).toBeInTheDocument();
    expect(screen.getAllByText('Đã thu hồi').length).toBeGreaterThan(0);
  });

  it('filters certificates by status when clicking summary cards', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<AdminCertificatesPage />);

    expect(await screen.findByText('CERT-A1B2C3D4-10001')).toBeInTheDocument();

    // Click "Đã thu hồi" card
    const revokedCard = screen.getByText(/Đã thu hồi \(Vô hiệu hóa\)/i).closest('div');
    await user.click(revokedCard);

    await waitFor(() => {
      expect(screen.queryByText('CERT-A1B2C3D4-10001')).not.toBeInTheDocument();
      expect(screen.getByText('CERT-E5F6G7H8-10002')).toBeInTheDocument();
    });
  });

  it('opens preview modal directly in Admin without switching to student role', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<AdminCertificatesPage />);

    expect(await screen.findByText('CERT-A1B2C3D4-10001')).toBeInTheDocument();

    // Click view details button (Eye icon)
    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết/i });
    await user.click(viewButtons[0]);

    // Preview modal opens inside Admin
    expect(await screen.findByText(/Admin Preview/i)).toBeInTheDocument();
    expect(screen.getByText('EDUMOOC ACADEMY')).toBeInTheDocument();
    expect(screen.getByText('CHỨNG CHỈ HỢP LỆ & ĐÃ XÁC THỰC')).toBeInTheDocument();

    // Close preview modal
    const closeBtn = screen.getByRole('button', { name: /Đóng/i });
    await user.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByText(/Admin Preview/i)).not.toBeInTheDocument();
    });
  });

  it('opens revoke modal, requires reason, and revokes certificate', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<AdminCertificatesPage />);

    expect(await screen.findByText('CERT-A1B2C3D4-10001')).toBeInTheDocument();

    // Click "Thu hồi" button for the first certificate
    const revokeButton = screen.getByRole('button', { name: /Thu hồi/i });
    await user.click(revokeButton);

    // Modal opens
    expect(screen.getByText('Thu hồi chứng chỉ tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Lý do thu hồi')).toBeInTheDocument();

    // Try submit without reason
    const confirmButton = screen.getByRole('button', { name: /Xác nhận thu hồi/i });
    await user.click(confirmButton);
    expect(screen.getByText('Vui lòng nhập lý do thu hồi chứng chỉ!')).toBeInTheDocument();

    // Type reason and submit
    const textarea = screen.getByPlaceholderText(/Nhập lý do cụ thể/i);
    await user.type(textarea, 'Gian lận thi trắc nghiệm đồ án cuối khóa');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast.showToast).toHaveBeenCalledWith(
        expect.stringContaining('Đã thu hồi chứng chỉ CERT-A1B2C3D4-10001'),
        'info'
      );
    });
  });

  it('reinstates a revoked certificate when clicking Khôi phục', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<AdminCertificatesPage />);

    expect(await screen.findByText('CERT-E5F6G7H8-10002')).toBeInTheDocument();

    // Click "Khôi phục"
    const reinstateButton = screen.getByRole('button', { name: /Khôi phục/i });
    await user.click(reinstateButton);

    await waitFor(() => {
      expect(mockToast.confirm).toHaveBeenCalled();
      expect(mockToast.showToast).toHaveBeenCalledWith(
        expect.stringContaining('Đã khôi phục hiệu lực chứng chỉ CERT-E5F6G7H8-10002'),
        'success'
      );
    });
  });
});
