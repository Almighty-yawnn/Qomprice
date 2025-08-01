// app/about/page.tsx
import Link from 'next/link';

export default function AboutUsPage() {
    return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
    <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <Link href="/" className="hover:text-emerald-200">QomPrice</Link>
        </h1>
        <nav className="space-x-4 text-sm">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/terms-of-use" className="hover:underline"> Terms of Use </Link>
            <Link href="/privacy-policy" className="hover:underline"> Privacy Policy </Link>
            <Link href="/help-center" className="hover:underline"> Help Center </Link>
        </nav>
        </div>
    </header>

    <section className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 prose prose-lg text-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 align-center mb-6">About QomPrice</h1>

        <h2 className="mt-6">Our Mission</h2>
        <p>
            At QomPrice, our mission is to empower Ghanaian shoppers by bringing complete pricing transparency
            to online retail. We simplify the shopping journey by aggregating up-to-date prices and fees from
            multiple trusted e-commerce platforms, so you can confidently find the best deal at a glance.
        </p>

        <h2 className="mt-6">Our Vision</h2>
        <p>
            We envision a future where every Ghanaian enjoys seamless access to fair prices, efficient
            delivery options, and verified sellers—driving smarter purchasing decisions and boosting
            market competition for the benefit of consumers nationwide.
        </p>

        <h2 className="mt-6">What We Do</h2>
        <ul>
            <li>
            <strong>Compare Prices</strong> — Instantly view real-time prices from across multiple
            e-commerce sites, including total costs (shipping, handling, and taxes).
            </li>
            <li>
            <strong>Vendor Ratings</strong> — Rely on community-driven ratings and verified badges to choose
            reputable sellers.
            </li>
            <li>
            <strong>Cost Calculator</strong> — See exactly what you’ll pay at checkout, with no hidden fees.
            </li>
            <li>
            <strong>Deal Alerts</strong> — Get notified when your favorite product drops below your target price.
            </li>
        </ul>

        <h2 className="mt-6">Our Values</h2>
        <ul>
            <li><strong>Transparency</strong> — Every fee and price component is shown upfront.</li>
            <li><strong>Trust</strong> — We vet and rate vendors so you can shop with confidence.</li>
            <li><strong>Innovation</strong> — We continuously enhance our platform with AI-driven insights and new features.</li>
            <li><strong>User-Centricity</strong> — Your feedback guides our roadmap and ensures we solve real pain points.</li>
        </ul>

        <h2 className="mt-6">Meet the Team</h2>
        <p>
            Founded by a group of entrepreneurs passionate about e-commerce and digital empowerment,
            our small but dedicated team combines expertise in web development, data science, and local
            market insights to build tools that truly serve Ghanaian shoppers.
        </p>

        <h2 className="mt-6">Join Us</h2>
        <p>
            Whether you’re a shopper seeking the best value, a vendor wanting greater visibility, or a
            partner looking to integrate—reach out! Together, let’s drive a more transparent and efficient
            online retail ecosystem for Ghana.
        </p>

        <p className="mt-8 text-sm text-gray-500">
            For inquiries, partnerships, or feedback, email us at{' '}
            <Link href="mailto:support@qomprice.com" className="text-emerald-600 hover:underline">
            support@qomprice.com
            </Link>.
        </p>
        </div>
    </section>

    <footer className="bg-gray-800 text-gray-300 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
            <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/accessibility-statement" className="hover:text-white transition-colors">Accessibility</Link>
        </div>
        <p className="text-gray-400 mt-4">© {new Date().getFullYear()} QomPrice. All Rights Reserved.</p>
        </div>
    </footer>
    </main>
);
}
