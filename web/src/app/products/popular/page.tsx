// app/products/popular/page.tsx
import Link from 'next/link';

// You might fetch actual popular products here in a real app
const mockPopularProducts = [
  { id: '1', name: 'Latest Smartphone Model X', price: '$799' },
  { id: '2', name: 'High-Performance Laptop Pro', price: '$1299' },
  { id: '3', name: 'Wireless Noise-Cancelling Headphones', price: '$249' },
  { id: '4', name: 'Smart Home Assistant Hub', price: '$99' },
];

export default function PopularProductsPage() {
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
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center border-b pb-4">
            Popular Products
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Discover what&#39;s trending! Here are some of our most popular items right now.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPopularProducts.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                <p className="text-emerald-600 font-medium my-2">{product.price}</p>
                <Link href={`/products/${product.id}`} className="text-sm text-emerald-700 hover:underline">
                  View Details {/* Assuming you'll have individual product pages */}
                </Link>
              </div>
            ))}
          </div>
           <div className="text-center mt-10">
            <Link href="/" className="inline-block bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors">
                Explore More Products
            </Link>
          </div>
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