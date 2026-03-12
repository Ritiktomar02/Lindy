export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Dashboard Layout (sidebar + main) */}
      <aside className="w-64 border-r bg-gray-50 p-4 shrink-0">
        <nav className="font-medium text-gray-700">Lindy Dashboard App</nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
