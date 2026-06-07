import api from './api';

// Uploads a single file to /api/uploads and returns its public URL.
export const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/uploads', fd);
  return data.url;
};
