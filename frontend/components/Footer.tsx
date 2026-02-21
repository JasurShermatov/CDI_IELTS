import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">CDI IELTS</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Master your IELTS preparation with our comprehensive practice platform.
              Full practice tests, expert writing checks, and speaking sessions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tests" className="hover:text-white transition-colors">
                  Browse Tests
                </Link>
              </li>
              <li>
                <Link href="/speaking" className="hover:text-white transition-colors">
                  Speaking Practice
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span>Telegram Bot</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>support@cdi-ielts.uz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CDI IELTS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

