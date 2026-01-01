import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-dark-bg">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-text-primary">
          Welcome to <span className="text-accent-yellow">Weavy Clone</span>
        </h1>
        <p className="text-center text-text-secondary mb-8">
          Visual AI Workflow Builder with Google Gemini
        </p>
        <div className="flex justify-center">
          <Link
            href="/workflow"
            className="px-6 py-3 bg-accent-yellow text-dark-bg rounded-lg hover:opacity-90 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 focus:ring-offset-dark-bg"
          >
            Open Workflow Builder
          </Link>
        </div>
      </div>
    </main>
  );
}

