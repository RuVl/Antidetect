import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import type { Scan } from "@/api/scans";
import { useDeleteScans } from "@/api/scans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw, Search, Trash2, } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { humanizeDateTime } from "@/utils.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function ScanTable({ data }: { data: Scan[] }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'status' | undefined>();
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteScansMutation = useDeleteScans();

    const resetFilters = () => {
        setSearch('');
        setSortKey(undefined);
        setSortOrder('desc');
        setSelectedIds(new Set());
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
    const hasSelection = selectedIds.size > 0;

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map((s) => s.id)));
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleDelete = () => {
        deleteScansMutation.mutate(
            { ids: Array.from(selectedIds) },
            {
                onSuccess: () => {
                    setSelectedIds(new Set());
                    setIsDeleteDialogOpen(false);
                }
            }
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                <div className="relative flex-1 max-w-3xs">
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

                {(hasActiveFilters || hasSelection) && (
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

                {hasSelection && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-1.5 ml-auto"
                        disabled={deleteScansMutation.isPending}
                    >
                        <Trash2 className="h-3.5 w-3.5"/>
                        Удалить ({selectedIds.size})
                    </Button>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Checkbox
                                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Выбрать все"
                                />
                            </TableHead>
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
                                    colSpan={5}
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
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.has(scan.id)}
                                            onCheckedChange={() => toggleSelect(scan.id)}
                                            aria-label={`Выбрать скан ${scan.id}`}
                                        />
                                    </TableCell>
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

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить выбранные сканы?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить {selectedIds.size}
                            {selectedIds.size === 1 ? "скан" : "сканов"}? Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/75"
                            disabled={deleteScansMutation.isPending}
                        >
                            {deleteScansMutation.isPending ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}