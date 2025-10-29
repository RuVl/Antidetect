import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useCreateUser } from "@/api/users";
import { type Scan, useCreateScan } from "@/api/scans";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AxiosError } from "axios";
import { Link } from "@tanstack/react-router";
import { lookForAntidetect } from "@/utils.ts";

export function Scanner() {
    const [username, setUsername] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const createUser = useCreateUser();
    const createScan = useCreateScan();

    const isLoading = isScanning || createUser.isPending || createScan.isPending;
    const isError = createUser.isError || createScan.isError;
    const [errorMessage, setErrorMessage] = useState('');

    const isSuccess = createUser.isSuccess && createScan.isSuccess;
    const [scan, setScan] = useState<Scan>();

    const handleScan = async () => {
        if (!username.trim()) return;

        setIsSubmitted(true);

        try {
            setIsScanning(true);
            const result = await lookForAntidetect();
            setIsScanning(false);

            const user = await createUser.mutateAsync({ username: username });
            setScan(await createScan.mutateAsync({
                userId: user.id,
                useAntiDetect: result,
            }));

            setUsername('');
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            const defaultMessage = 'Ошибка при сканировании. Попробуйте снова.';
            if (error instanceof AxiosError) {
                setErrorMessage(error.response?.data?.message ?? defaultMessage);
            } else {
                setErrorMessage(defaultMessage);
                console.error('Ошибка при сканировании:', error);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Сканирование браузера</CardTitle>
                    <CardDescription>
                        Введите ваше имя для запуска сканирования
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Имя</Label>
                        <Input
                            id="username"
                            placeholder="Введите ваше имя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            onKeyDown={(e) => e.key === "Enter" && handleScan()}
                        />
                    </div>

                    {isSubmitted && (
                        <div className="space-y-2">
                            {isError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4"/>
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            {isSuccess && (
                                <Link to="/scans/$id" params={{ id: scan!.id.toString() }}>
                                    <Alert className="border-green-600">
                                        <CheckCircle2 className="h-4 w-4 text-green-600"/>
                                        <AlertDescription className="text-green-800">
                                            Сканирование успешно завершено!
                                        </AlertDescription>
                                    </Alert>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        onClick={handleScan}
                        disabled={!username.trim() || isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Сканирование...
                            </>
                        ) : (
                            'Начать сканирование'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}