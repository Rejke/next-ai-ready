import { Button } from '@/shared/ui';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-bold text-4xl">Welcome to Next.js with shadcn/ui</h1>
      <p className="text-lg text-muted-foreground">
        Built with Feature-Sliced Design architecture
      </p>
      <div className="flex gap-4">
        <Button>Default Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  );
}
