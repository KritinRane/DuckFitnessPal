import MacroDashboard from "@/components/MacroDashboard";
import Link from "next/link";

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex-1 max-w-md mx-auto w-full px-5 pt-10 pb-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">DuckFitnessPal</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      <MacroDashboard />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/menu"
          className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-red-100 dark:hover:border-gray-700 rounded-xl p-4 transition-colors"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Today&apos;s Menu</p>
            <p className="text-xs text-gray-400 mt-0.5">Pierce Dining Hall</p>
          </div>
        </Link>
        <Link
          href="/log"
          className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-red-100 dark:hover:border-gray-700 rounded-xl p-4 transition-colors"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">My Food Log</p>
            <p className="text-xs text-gray-400 mt-0.5">Track your meals</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
