import { createFileRoute } from '@tanstack/react-router'
import { useScans } from "@/api/scans.ts";
import { ScanTable } from "@/components/ScanTable.tsx";

export const Route = createFileRoute('/scans/')({
    component: RouteComponent
})

function RouteComponent() {
    const { data, isLoading, isError } = useScans();

    // i'm lazy...
    if (isLoading) return <></>;
    if (isError || !data) return <></>;

    return (
        <>
            <h1 className="text-2xl font-semibold mb-4">История сканов</h1>
            <ScanTable data={data}/>
        </>
    );
}
