// app/privacy-policy/page.tsx
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Your privacy is important to us. It is Komprice&#39;s policy to respect your privacy regarding any information we may collect from you across our website, qommprice.com, and other sites we own and operate.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
            <p>
              Log data: When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
            </p>
            <p>
              Device data: We may also collect data about the device you&apos;re using to access our website. This data may include the device type, operating system, unique device identifiers, device settings, and geo-location data.
            </p>
            <p>
              Personal information: We may ask for personal information, such as your name, email, social media profiles, phone/mobile number, home/mailing address, payment information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Legal Bases for Processing</h2>
            <p>
              We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Use of Information</h2>
            <p>
              We may use a combination of personally identifiable and non-personally identifiable information to understand how our visitors use our website, how to improve their experience, and to communicate with them.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Data Security</h2>
            <p>
              We take security seriously and take precautions to protect your information. We have implemented physical, electronic, and managerial procedures to help safeguard, prevent unauthorized access, maintain data security, and correctly use your information.
            </p>
            {/* Add more sections:
                - Data Retention
                - Cookies
                - Third-Party Services
                - Children's Privacy
                - Your Rights
                - Changes to This Policy
            */}
            <p className="mt-8">
              For any questions or concerns regarding your privacy, you may contact us using the following details: <Link href="mailto:support@komprice.com" className="text-emerald-600 hover:underline">support@komprice.com</Link>.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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