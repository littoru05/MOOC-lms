import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateApi } from '../api/certificateApi';

export const useAdminCertificates = (params) => {
  return useQuery({
    queryKey: ['admin', 'certificates', params],
    queryFn: async () => {
      const res = await certificateApi.getAdminCertificates(params);
      return res.data;
    },
    keepPreviousData: true,
  });
};

export const useAdminCertificateSummary = () => {
  return useQuery({
    queryKey: ['admin', 'certificates', 'summary'],
    queryFn: async () => {
      const res = await certificateApi.getAdminCertificateSummary();
      return res.data;
    },
  });
};

export const useRevokeCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => certificateApi.revokeCertificate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'certificates'] });
    },
  });
};

export const useReinstateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => certificateApi.reinstateCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'certificates'] });
    },
  });
};

