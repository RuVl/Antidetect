import { createFileRoute } from '@tanstack/react-router'
import { Scanner } from "@/components/Scanner.tsx";

const App = () => <Scanner/>;

export const Route = createFileRoute('/')({
    component: App
})
