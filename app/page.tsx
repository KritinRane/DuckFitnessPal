import MacroDashboard from "@/components/MacroDashboard";
import Link from "next/link";

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DuckFitnessPal</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      <MacroDashboard />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/menu"
          className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:border-red-200 hover:shadow-md transition-all"
        >
          <span className="text-2xl">🍽️</span>
          <span className="text-sm font-semibold text-gray-800">Today&apos;s Menu</span>
          <span className="text-xs text-gray-400 text-center">Browse Pierce Dining Hall</span>
        </Link>
        <Link
          href="/log"
          className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:border-red-200 hover:shadow-md transition-all"
        >
          <span className="text-2xl">📋</span>
          <span className="text-sm font-semibold text-gray-800">My Food Log</span>
          <span className="text-xs text-gray-400 text-center">View what you&apos;ve eaten</span>
        </Link>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 space-y-1">
        <p className="font-semibold">Pierce Dining Hall</p>
        <p className="text-red-500 text-xs">
          Menu syncs automatically at midnight. Use the Menu tab to log meals.
        </p>
      </div>
    </main>
  );
}
