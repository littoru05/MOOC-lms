import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessonFileUpload } from '../../components/instructor/LessonFileUpload';
import { fileApi } from '../../api/fileApi';

describe('LessonFileUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct labels and placeholder for VIDEO content type', () => {
    render(
      <LessonFileUpload
        contentType="VIDEO"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Chọn video từ máy')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dán liên kết YouTube hoặc video...')).toBeInTheDocument();
    expect(screen.getByText(/MP4, WebM ≤ 200MB/i)).toBeInTheDocument();
  });

  it('renders correct labels and placeholder for DOCUMENT content type', () => {
    render(
      <LessonFileUpload
        contentType="DOCUMENT"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Chọn tài liệu PDF')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dán liên kết tài liệu hoặc URL...')).toBeInTheDocument();
    expect(screen.getByText(/PDF ≤ 20MB/i)).toBeInTheDocument();
  });

  it('rejects invalid file extension for VIDEO type', async () => {
    render(
      <LessonFileUpload
        contentType="VIDEO"
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByTestId('lesson-file-input');
    const invalidFile = new File(['dummy'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Video tối đa 200MB, định dạng MP4 hoặc WebM')).toBeInTheDocument();
    });
  });

  it('rejects oversized file for DOCUMENT type (> 20MB)', async () => {
    render(
      <LessonFileUpload
        contentType="DOCUMENT"
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByTestId('lesson-file-input');
    // Create a 21MB mock file
    const oversizedFile = new File(['x'.repeat(100)], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 21 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(screen.getByText('Tài liệu tối đa 20MB, định dạng PDF')).toBeInTheDocument();
    });
  });

  it('handles valid video file upload successfully', async () => {
    const handleChange = vi.fn();
    const handleUploadState = vi.fn();
    const uploadSpy = vi.spyOn(fileApi, 'uploadFile').mockResolvedValueOnce({
      url: '/api/v1/files/sample-lesson.mp4',
      filename: 'sample-lesson.mp4',
    });

    render(
      <LessonFileUpload
        contentType="VIDEO"
        value=""
        onChange={handleChange}
        onUploadStateChange={handleUploadState}
      />
    );

    const input = screen.getByTestId('lesson-file-input');
    const validVideo = new File(['dummy-mp4-data'], 'lecture.mp4', { type: 'video/mp4' });

    fireEvent.change(input, { target: { files: [validVideo] } });

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith(
        validVideo,
        'video',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
          onUploadProgress: expect.any(Function),
        })
      );
      expect(handleChange).toHaveBeenCalledWith('/api/v1/files/sample-lesson.mp4');
    });
  });

  it('allows manual URL input as an alternative', () => {
    const handleChange = vi.fn();

    render(
      <LessonFileUpload
        contentType="VIDEO"
        value=""
        onChange={handleChange}
      />
    );

    const urlInput = screen.getByPlaceholderText('Dán liên kết YouTube hoặc video...');
    fireEvent.change(urlInput, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });

    expect(handleChange).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('clears input when remove button is clicked', () => {
    const handleChange = vi.fn();

    render(
      <LessonFileUpload
        contentType="VIDEO"
        value="https://example.com/video.mp4"
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByTitle('Xóa URL');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });
});

