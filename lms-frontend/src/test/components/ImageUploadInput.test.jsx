import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploadInput } from '../../components/common/ImageUploadInput';
import { ToastProvider } from '../../context/ToastContext';

const Wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

describe('ImageUploadInput Component', () => {
  it('renders input with initial value and allows manual URL typing', () => {
    const handleChange = vi.fn();
    render(
      <Wrapper>
        <ImageUploadInput
          value="https://images.unsplash.com/test.jpg"
          onChange={handleChange}
          label="Ảnh đại diện"
        />
      </Wrapper>
    );

    const input = screen.getByDisplayValue('https://images.unsplash.com/test.jpg');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'https://images.unsplash.com/new.jpg' } });
    expect(handleChange).toHaveBeenCalledWith('https://images.unsplash.com/new.jpg');
  });

  it('handles file selection and upload through fileApi', async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Wrapper>
        <ImageUploadInput
          value=""
          onChange={handleChange}
          label="Tải ảnh bìa"
        />
      </Wrapper>
    );

    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('/api/v1/files/mock-uploaded-image.png');
    });
  });
});
