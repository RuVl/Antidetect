import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export const Route = createRootRoute({
    component: () => (
        <SidebarProvider>
            <div className="flex min-w-svw">
                <AppSidebar/>
                <main className="flex-1 flex flex-col">
                    <header className="flex items-center gap-4 p-4 border-b">
                        <SidebarTrigger/>
                        <BreadcrumbNav/>
                    </header>
                    <div className="flex-1 p-6 container mx-auto">
                        <Outlet/>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    ),
    loader: () => ({
        crumb: 'Главная',
    }),
});