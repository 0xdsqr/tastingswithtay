import { Button } from "@moth/ui/components/button"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">🪶 carry on</h1>
      <Button variant="outline">let's go</Button>
    </main>
  )
}
