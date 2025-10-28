import { createFileRoute, Outlet } from '@tanstack/react-router'
import type { Scan } from "@/api/scans.ts";
import { api } from "@/api/api.ts";
import type { QueryClient } from "@tanstack/query-core";
import { humanizeDateTime } from "@/utils.ts";

const RouteComponent = () => <Outlet/>;

export const Route = createFileRoute('/scans/$id')({
    component: RouteComponent,
    loader: async ({ params, context }) => {
        const { id } = params;
        // @ts-ignore
        const queryClient: QueryClient | undefined = context?.queryClient;
        if (!queryClient) return { crumb: 'Скан' };

        const scan: Scan | undefined = await queryClient.fetchQuery({
            queryKey: ['scan', +id],
            queryFn: async () => {
                const { data } = await api.get(`/scans/${id}`);
                return data;
            },
        });

        return {
            crumb: scan ? `Скан ${humanizeDateTime(scan.createdAt)}` : 'Скан',
        };
    },
});
