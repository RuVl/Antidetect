import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api.ts";

// ===== DTO models =====

export interface User {
    id: number;
    username: string;
}

export interface CreateUserDto {
    username: string;
}

// ===== API Endpoints =====

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation<User, Error, CreateUserDto>({
        mutationFn: async (dto) => {
            const { data } = await api.post('/users', dto);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    });
};

export const useUser = (id: number) => useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: async () => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    }
});