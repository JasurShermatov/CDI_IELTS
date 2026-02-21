import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-[var(--primary)] mb-6">
          Welcome to CDI IELTS
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Master your IELTS preparation with our comprehensive practice platform
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="card">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2 text-[var(--primary)]">
              Practice Tests
            </h3>
            <p className="text-gray-600">
              Access full-length IELTS practice tests with listening, reading, and writing sections
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-[var(--primary)]">
              Expert Checking
            </h3>
            <p className="text-gray-600">
              Get your writing tasks checked by experienced IELTS teachers
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🗣️</div>
            <h3 className="text-xl font-bold mb-2 text-[var(--primary)]">
              Speaking Practice
            </h3>
            <p className="text-gray-600">
              Schedule speaking sessions with qualified instructors
            </p>
          </div>
        </div>

        <div className="mt-12 flex gap-4 justify-center">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link href="/tests" className="btn-secondary text-lg px-8 py-3">
            Browse Tests
          </Link>
        </div>
      </div>
    </div>
  );
}
