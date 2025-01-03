export default function GettingStarted() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Getting Started with SupaVec</h1>

      <p>
        SupaVec is a powerful tool for working with vector embeddings and
        semantic search using Supabase. This guide will help you get started
        with setting up and using SupaVec in your projects.
      </p>

      <h2>What is SupaVec?</h2>

      <p>SupaVec provides a simple and efficient way to:</p>

      <ul>
        <li>Generate vector embeddings from text and files</li>
        <li>Store embeddings in Supabase vector store</li>
        <li>Perform semantic search queries</li>
        <li>Build AI-powered search applications</li>
      </ul>

      <h2>Prerequisites</h2>

      <p>Before you begin, make sure you have:</p>

      <ul>
        <li>Node.js 18 or later installed</li>
        <li>A Supabase account and project</li>
        <li>Basic familiarity with TypeScript and React</li>
      </ul>

      <div className="not-prose">
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">
            Quick Tip
          </h3>
          <p className="text-blue-700 dark:text-blue-200">
            Check out our installation guide for detailed setup instructions and
            configuration options.
          </p>
        </div>
      </div>
    </article>
  );
}
