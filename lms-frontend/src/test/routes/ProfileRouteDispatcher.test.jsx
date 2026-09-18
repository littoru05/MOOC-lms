import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfileRouteDispatcher } from '../../routes/ProfileRouteDispatcher';
import * as AuthContextModule from '../../context/AuthContext';

describe('ProfileRouteDispatcher', () => {
  it('redirects to /instructor/profile when user is instructor', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'ROLE_INSTRUCTOR', fullName: 'Instructor' },
      isInstructor: true,
      isAdmin: false,
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileRouteDispatcher />} />
          <Route path="/instructor/profile" element={<div>Instructor Profile Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Instructor Profile Page Target')).toBeInTheDocument();
  });

  it('redirects to /admin/profile when user is admin', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'ROLE_ADMIN', fullName: 'Admin' },
      isInstructor: false,
      isAdmin: true,
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileRouteDispatcher />} />
          <Route path="/admin/profile" element={<div>Admin Profile Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Profile Page Target')).toBeInTheDocument();
  });
});
