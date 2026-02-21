import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CDI IELTS — Master Your IELTS Score',
  description:
    'Comprehensive IELTS practice platform with full-length tests, expert writing feedback, and live speaking sessions. Start preparing today.',
};

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 500+ IELTS students
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              Master Your IELTS with <span className="text-yellow-300">CDI</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-10 leading-relaxed">
              Comprehensive practice platform with full-length tests, expert writing feedback,
              and live speaking sessions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-red-700 font-bold py-4 px-10 rounded-xl text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.97]"
              >
                Get Started Free
              </Link>
              <Link
                href="/tests"
                className="border-2 border-white text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-white/10 transition-all"
              >
                Browse Tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Everything You Need
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          Our platform provides all the tools for effective IELTS preparation
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: '📚',
              title: 'Practice Tests',
              desc: 'Full-length IELTS practice tests with listening, reading, and writing sections',
            },
            {
              icon: '🎯',
              title: 'Expert Checking',
              desc: 'Get your writing tasks checked and scored by experienced IELTS teachers',
            },
            {
              icon: '🗣️',
              title: 'Speaking Practice',
              desc: 'Schedule one-on-one speaking sessions with qualified IELTS instructors',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card-interactive text-center group"
            >
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '1', icon: '📝', title: 'Register', desc: 'Create your account via Telegram bot' },
              { step: '2', icon: '💳', title: 'Top Up', desc: 'Add balance via Click payment' },
              { step: '3', icon: '📖', title: 'Take Tests', desc: 'Purchase and complete IELTS tests' },
              { step: '4', icon: '📊', title: 'Get Results', desc: 'View scores and teacher feedback' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Start Preparing?
        </h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Join CDI IELTS today and take the first step towards your target score
        </p>
        <Link
          href="/register"
          className="btn-primary text-lg px-10 py-4"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
