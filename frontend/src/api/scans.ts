import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api.ts";

// ===== DTO models =====

export interface Scan {
    id: number;
    useAntiDetect: boolean;
    userId: number;
    createdAt: string;
}

export interface CreateScanDto {
    useAntiDetect: boolean;
    userId: number;
}

export interface DeleteScansDto {
    ids: number[];
}

// ===== API Endpoints =====

export const useCreateScan = () => {
    const queryClient = useQueryClient();
    return useMutation<Scan, Error, CreateScanDto>({
        mutationFn: async (dto) => {
            const { data } = await api.post('/scans', dto);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scans'] })
    });
};

export const useScans = () => useQuery<Scan[], Error>({
    queryKey: ['scans'],
    queryFn: async () => {
        const { data } = await api.get('/scans');
        return data;
    }
});

export const useDeleteScans = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, DeleteScansDto>({
        mutationFn: async (dto) => {
            await api.delete('/scans', { data: dto });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scans'] })
    });
};

export const useScan = (id: number) => useQuery<Scan, Error>({
    queryKey: ['scan', id],
    queryFn: async () => {
        const { data } = await api.get(`/scans/${id}`);
        return data;
    }
});

export const useDeleteScan = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: async (id) => {
            await api.delete(`/scans/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scans'] })
    });
};
