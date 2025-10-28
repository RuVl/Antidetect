import { createFileRoute, Outlet } from '@tanstack/react-router'

const RouteComponent = () => <Outlet/>;

export const Route = createFileRoute('/scans')({
    component: RouteComponent,
    loader: () => ({
        crumb: 'История сканов'
    }),
});
