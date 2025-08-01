// app/terms-of-use/page.tsx
import Link from 'next/link';

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <Link href="/" className="hover:text-emerald-200">QomPrice</Link>
          </h1>
          <nav>
            <Link href="/help-center" className="text-sm hover:underline">Help Center</Link>
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            Terms of Use
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Welcome to QomPrice! These Terms of Use (“Terms”) govern your access to and use of the QomPrice website and mobile applications (collectively, the “Service”), operated by QomPrice (“we,” “us,” or “our”).
            </p>
            <p>
              By accessing or using QomPrice, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. About QomPrice</h2>
            <p>
              QomPrice is a price comparison platform that helps users find and compare prices of products across multiple e-commerce websites. Our Service provides links that redirect you to third-party retailers’ websites (“Partner Sites”) where you can complete your purchase.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Use of the Service</h2>
            <p>
              Unless otherwise stated, QomPrice and/or its licensors own the intellectual property rights for all material on QomPrice. All intellectual property rights are reserved. You may access this from QomPrice for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <ul>
              <li>You may use the Service for personal, non-commercial purposes only.</li>
              <li>By using the Service, you acknowledge that QomPrice does not sell products directly and that all purchases are made on the third-party Partner Sites.</li>
              <li>We do not guarantee the availability, pricing, or quality of products listed on Partner Sites.</li>
              <li>Prices, promotions, and availability may change without notice; always check the Partner Site for the most current information.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Intellectual Property</h2>
            <ul>
              <li>All content on QomPrice, including logos, text, graphics, images, and software, is owned by or licensed to QomPrice and is protected by copyright, trademark, and other intellectual property laws.</li>
              <li>You may view and use the material for personal use only.</li>
              <li>You may not copy, reproduce, republish, distribute, sell, or create derivative works from our content without prior written permission.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Redirects to Third-Party Sites</h2>
            <ul>
              <li>When you click on product links, you will be redirected to Partner Sites.</li>
              <li>QomPrice is not responsible for the content, terms, privacy policies, or practices of these Partner Sites.</li>
              <li>Your use of Partner Sites is subject to their terms and conditions and privacy policies.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. User Comments & Reviews</h2>
            <ul>
              <li>Some parts of the Service may allow users to post comments, reviews, or other content.</li>
              <li>These user-generated contents reflect the views of the author, not QomPrice.</li>
              <li>We do not endorse or verify user comments but reserve the right to remove any content deemed inappropriate, offensive, or that violates these Terms.</li>
              <li>You agree not to post unlawful, defamatory, or harmful content.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies and Tracking</h2>
            <ul>
              <li>We use cookies and similar technologies to improve your experience, analyze use of the Service, and serve personalized content and advertisements.</li>
              <li>By using QomPrice, you consent to our use of cookies as described in our Privacy Policy.</li>
              <li>You can control cookie preferences through your browser settings.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Disclaimer of Warranties</h2>
            <ul>
              <li>The Service is provided “as is” and “as available” without warranties of any kind.</li>
              <li>We make no guarantees regarding the accuracy, completeness, or reliability of the information on QomPrice.</li>
              <li>Your use of the Service is at your own risk.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
            <ul>
              <li>QomPrice shall not be liable for any damages arising from your use of the Service or any Partner Site, including but not limited to lost profits, data loss, or business interruption.</li>
              <li>We disclaim responsibility for any errors, omissions, or inaccuracies in product listings.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Indemnification</h2>
            <p>You agree to indemnify and hold harmless QomPrice, its affiliates, and employees from any claims, damages, liabilities, costs, or expenses arising from your use of the Service or violation of these Terms.</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes to Terms</h2>
            <ul>
              <li>We may update these Terms at any time by posting revised terms on our site.</li>
              <li>It is your responsibility to review these Terms periodically.</li>
              <li>Continued use of QomPrice after changes constitutes acceptance of the updated Terms.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where QomPrice operates, without regard to conflict of law principles.</p>

            {/* Add more sections as needed:
                - Your Content
                - Hyperlinking to our Content
                - iFrames
                - Content Liability
                - Reservation of Rights
                - Removal of links from our website
                - Disclaimer
            */}
            <p className="mt-8">
              Please review these Terms of Use periodically for changes. If you have any questions about these Terms, please contact us at <Link href="mailto:support@qomprice.com" className="text-emerald-600 hover:underline">support@qomprice.com</Link>.
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
          <p className="text-gray-400 mt-4">&copy; {new Date().getFullYear()} QomPrice. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}