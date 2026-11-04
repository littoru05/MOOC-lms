import client from './client';

export const fileApi = {
  uploadFile: async (file, type = 'image', options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post(`/api/v1/files/upload?type=${encodeURIComponent(type)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options.onUploadProgress,
      signal: options.signal,
    });
    return res.data;
  },
};
