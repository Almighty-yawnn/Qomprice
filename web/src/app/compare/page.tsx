// app/compare/page.tsx
import Link from 'next/link';

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <Link href="/" className="hover:text-emerald-200">Komprice</Link>
          </h1>
          <nav>
            <Link href="/help-center" className="text-sm hover:underline">Help Center</Link>
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Compare Prices
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Our product comparison tool is coming soon! Check back later to compare features, prices, and reviews for your favorite products.
          </p>
          <Link href="/" className="inline-block bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
       <footer className="bg-gray-800 text-gray-300 pt-10 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs">
             <div className="flex flex-wrap justify-center md:justify-center gap-x-4 gap-y-2 mb-4 md:mb-0">
                <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
                <Link href="/accessibility-statement" className="hover:text-white transition-colors">Accessibility</Link>
              </div>
          <p className="text-gray-400 mt-4">&copy; {new Date().getFullYear()} Komprice. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}