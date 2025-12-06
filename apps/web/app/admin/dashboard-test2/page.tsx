import { YourTopPriorities } from "@/components/dashboard-test2/YourTopPriorities";
import { NeedsYourAction } from "@/components/dashboard-test2/NeedsYourAction";
import { Feed } from "@/components/dashboard-test2/Feed";

export default function DashboardTest2() {
  return (
    <div className="flex flex-col h-screen bg-bg-2">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-bg-0 shadow-md">
        <h1 className="text-3xl font-bold text-ink-900">
          Admin Dashboard
        </h1>
        <nav>
          {/* Add navigation links here if needed */}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
