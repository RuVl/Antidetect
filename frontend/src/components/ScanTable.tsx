import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import type { Scan } from "@/api/scans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw, Search, } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { humanizeDateTime } from "@/utils.ts";

export function ScanTable({ data }: { data: Scan[] }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'status' | undefined>();
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const resetFilters = () => {
        setSearch('');
        setSortKey(undefined);
        setSortOrder('desc');
    };

    const filtered = useMemo(() => {
        const filtered_data = data.filter((s) =>
            s.id.toString().includes(search.trim())
        );
        const result = [...filtered_data];

        if (sortKey === "date") {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        if (sortKey === "status") {
            result.sort((a, b) => +b.useAntiDetect - +a.useAntiDetect);
        }

        return sortOrder === "desc" ? result : result.reverse();
    }, [data, search, sortKey, sortOrder]);

    const toggleSort = (key: "date" | "status" | undefined) => {
        if (sortKey === key) {
            setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("desc");
        }
    };

    const getSortIcon = (key: "date" | "status") => {
        if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5"/>;
        return sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5"/>
        ) : (
            <ArrowDown className="h-3.5 w-3.5"/>
        );
    };

    const hasActiveFilters = search || sortKey;

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Искать по id"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={sortKey === "date" ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSort("date")}
                        className="flex items-center gap-1"
                    >
                        {getSortIcon("date")}
                        По дате
                    </Button>
                    <Button
                        variant={sortKey === "status" ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSort("status")}
                        className="flex items-center gap-1"
                    >
                        {getSortIcon("status")}
                        По статусу
                    </Button>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="h-3.5 w-3.5"/>
                        Сбросить
                    </Button>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID скана</TableHead>
                            <TableHead className="text-center">Обнаружен анти-детект браузер</TableHead>
                            <TableHead className="text-center">ID пользователя</TableHead>
                            <TableHead className="text-right">Дата сканирования</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Нет данных
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((scan) => (
                                <TableRow
                                    key={scan.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => navigate({ to: `/scans/${scan.id}` })}
                                >
                                    <TableCell className="font-medium">#{scan.id}</TableCell>
                                    <TableCell className="text-center">
                                        {scan.useAntiDetect ? (
                                            <Badge className="bg-red-100 text-red-800">Да</Badge>
                                        ) : (
                                            <Badge className="bg-green-100 text-green-800">Нет</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{scan.userId}</TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {humanizeDateTime(scan.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}