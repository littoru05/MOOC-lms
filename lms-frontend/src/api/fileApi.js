import client from './client';

export const fileApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
