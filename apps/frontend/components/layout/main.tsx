export function Main({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6">
      {children}
    </main>
  );
}
