import { createFileRoute } from '@tanstack/react-router';
import { useScan } from '@/api/scans.ts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useUser } from "@/api/users.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item.tsx";
import { BadgeCheckIcon, Calendar, ShieldAlert, User } from "lucide-react";
import { humanizeDateTime } from "@/utils.ts";

export const Route = createFileRoute('/scans/$id/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { id } = Route.useParams();
    const { data: scan, isLoading: scanIsLoading, error: scanError } = useScan(+id);
    const { data: user, isLoading: userIsLoading, error: userError } = scan ? useUser(scan.userId) : {};

    if (scanIsLoading || userIsLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-1/2"/>
                    <Skeleton className="h-4 w-1/3 mt-2"/>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full"/>
                </CardContent>
            </Card>
        );
    }

    if (scanError || userError || !user || !scan) {
        let errorMessage = scanError?.message || userError?.message || 'Скан не найден!';
        if (scan) errorMessage = 'Пользователь не найден!';
        return (
            <Alert variant="destructive" className="w-full max-w-2xl mx-auto">
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Результат сканирования</CardTitle>
                <CardDescription>Сканирование №{scan.id}</CardDescription>
            </CardHeader>
            <CardContent>
                <ItemGroup>
                    <Item variant="outline" size="sm" className="mb-3">
                        <ItemMedia>
                            {scan.useAntiDetect ? (
                                <ShieldAlert className="size-5"/>
                            ) : (
                                <BadgeCheckIcon className="size-5"/>
                            )}
                        </ItemMedia>
                        <ItemContent>
                            {scan.useAntiDetect ? (
                                <ItemTitle>Обнаружен анти-детект браузер!</ItemTitle>
                            ) : (
                                <ItemTitle>Пользователь не использует анти-детект браузер</ItemTitle>
                            )}
                        </ItemContent>
                    </Item>
                    <Item variant="outline" size="sm" className="mb-3">
                        <ItemMedia>
                            <User className="size-5"/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{user.username}</ItemTitle>
                        </ItemContent>
                    </Item>
                    <Item variant="outline" size="sm" className="mb-3">
                        <ItemMedia>
                            <Calendar className="size-5"/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{humanizeDateTime(scan.createdAt)}</ItemTitle>
                        </ItemContent>
                    </Item>
                </ItemGroup>
            </CardContent>
        </Card>
    );
}