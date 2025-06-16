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
              Welcome to QomPrice! These terms and conditions outline the rules and regulations for the use of QomPrice&#39;s Website, located at [Your Website URL].
            </p>
            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use QomPrice if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Cookies</h2>
            <p>
              We employ the use of cookies. By accessing QomPrice, you agreed to use cookies in agreement with the QomPrice&#39;s Privacy Policy. Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">License</h2>
            <p>
              Unless otherwise stated, QomPrice and/or its licensors own the intellectual property rights for all material on QomPrice. All intellectual property rights are reserved. You may access this from QomPrice for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <p>You must not:</p>
            <ul>
              <li>Republish material from QomPrice</li>
              <li>Sell, rent or sub-license material from QomPrice</li>
              <li>Reproduce, duplicate or copy material from QomPrice</li>
              <li>Redistribute content from QomPrice</li>
            </ul>
            <p>This Agreement shall begin on the date hereof.</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">User Comments</h2>
            <p>
              Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. QomPrice does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of QomPrice,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, QomPrice shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
            </p>
            <p>
              QomPrice reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
            </p>
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
              Please review these Terms of Use periodically for changes. If you have any questions about these Terms, please contact us at <Link href="mailto:support@QomPrice.com" className="text-emerald-600 hover:underline">support@QomPrice.com</Link>.
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