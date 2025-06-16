// app/sitemap/page.tsx
import Link from 'next/link';

const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare Prices' },
  { href: '/products/popular', label: 'Popular Products' },
  { href: '/help-center', label: 'Help Center' },
  // Add more main category or product listing pages here
];

const legalLinks = [
  { href: '/terms-of-use', label: 'Terms of Use' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
  { href: '/accessibility-statement', label: 'Accessibility Statement' },
];

export default function SitemapPage() {
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
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
            Sitemap
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Main Navigation</h2>
              <ul className="space-y-2">
                {mainLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-emerald-600 hover:text-emerald-800 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {/* You might want to dynamically list product categories or important product pages if feasible */}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Information</h2>
              <ul className="space-y-2">
                {legalLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-emerald-600 hover:text-emerald-800 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                    <Link href="/help-center#faqs" className="text-emerald-600 hover:text-emerald-800 hover:underline">
                      Frequently Asked Questions
                    </Link>
                  </li>
              </ul>
            </div>
          </div>
          <p className="mt-10 text-sm text-gray-600">
            If you can&#39;t find what you&#39;re looking for, please feel free to <Link href="/help-center" className="text-emerald-600 hover:underline">contact our support team</Link>.
          </p>
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