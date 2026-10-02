'use client';

import Dashboard from "@/features/user/components/Dashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Dashboard />
      </div>
    </main>
  );
}
