import { YourTopPriorities } from "@/components/dashboard-test3/YourTopPriorities";
import { NeedsYourAction } from "@/components/dashboard-test3/NeedsYourAction";
import { Feed } from "@/components/dashboard-test3/Feed";

export default function DashboardTest3() {
  return (
    <div className="flex flex-col h-screen bg-bg-1">
      {/* Header - More compact */}
      <header className="flex items-center justify-between px-4 py-3 bg-bg-0 shadow-sm">
        <h1 className="text-xl font-semibold text-ink-900">
          Admin Dashboard
        </h1>
        <nav>
          {/* Add navigation links here if needed */}
        </nav>
      </header>

      {/* Main content - Tighter spacing */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <YourTopPriorities />
            <NeedsYourAction />
            <div className="md:col-span-2">
              <Feed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
