import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: "AI Tool Directory - Discover the Best AI Tools",
  description: "Comprehensive directory of AI tools for text, image, video, code, and more. Compare features, pricing, and find the perfect AI tool for your needs.",
  keywords: ["AI tools", "artificial intelligence", "AI directory", "compare AI tools", "AI software", "machine learning tools"],
  authors: [{ name: "AI Tool Directory" }],
  openGraph: {
    title: "AI Tool Directory - Discover the Best AI Tools",
    description: "Find, compare, and choose the perfect AI tool for your needs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tool Directory - Discover the Best AI Tools",
    description: "Comprehensive directory of AI tools for all your needs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  AI
                </div>
                <span className="font-bold text-xl text-gray-900">AI Tool Directory</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Browse Tools
                </Link>
                <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Blog
                </Link>
                <Link href="/compare" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Compare
                </Link>
                <Link href="/tools" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Search tools">
                  <Search className="w-5 h-5" />
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">AI Tool Directory</h3>
                <p className="text-sm text-gray-600">
                  Discover and compare the best AI tools for your needs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/tools?category=Text AI" className="hover:text-gray-900">Text AI</Link></li>
                  <li><Link href="/tools?category=Image AI" className="hover:text-gray-900">Image AI</Link></li>
                  <li><Link href="/tools?category=Video AI" className="hover:text-gray-900">Video AI</Link></li>
                  <li><Link href="/tools?category=Code AI" className="hover:text-gray-900">Code AI</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/tools" className="hover:text-gray-900">All Tools</Link></li>
                  <li><Link href="/compare" className="hover:text-gray-900">Compare Tools</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">About</h4>
                <p className="text-sm text-gray-600">
                  Updated daily with the latest AI tools and features.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} AI Tool Directory. All rights reserved.</p>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
