import { Link, useRouterState } from "@tanstack/react-router";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";

export function AppSidebar() {
    const state = useRouterState();
    const currentPath = state.location.pathname;

    const pathMap = [
        { path: '/', text: 'Главная' },
        { path: '/scans', text: 'История сканов' },
    ];

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Навигация</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {pathMap.map(({ path, text }) => (
                                <SidebarMenuItem key={path}>
                                    <SidebarMenuButton asChild isActive={currentPath === path}>
                                        <Link to={path}>{text}</Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}