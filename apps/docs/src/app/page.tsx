import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome to SupaVec Documentation
        </h1>

        <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
          Learn how to use SupaVec for vector embeddings and semantic search
          with Supabase.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/getting-started"
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Getting Started →
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Quick start guide to set up and run your first vector search.
            </p>
          </Link>

          <Link
            href="/docs/api-reference"
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              API Reference →
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed API documentation and examples.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
