// app/accessibility-statement/page.tsx
import Link from 'next/link';

export default function AccessibilityStatementPage() {
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
            Accessibility Statement
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Komprice is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Measures to Support Accessibility</h2>
            <p>Komprice takes the following measures to ensure accessibility of its website:</p>
            <ul>
              <li>Include accessibility as part of our mission statement.</li>
              <li>Integrate accessibility into our procurement practices.</li>
              <li>Appoint an accessibility officer and/or ombudsperson.</li>
              <li>Provide continual accessibility training for our staff.</li>
              <li>Assign clear accessibility targets and responsibilities.</li>
              <li>Employ formal accessibility quality assurance methods.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Conformance Status</h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Komprice is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard. We are working towards full AA conformance.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of Komprice. Please let us know if you encounter accessibility barriers on Komprice:
            </p>
            <ul>
              <li>E-mail: <Link href="mailto:support@komprice.com" className="text-emerald-600 hover:underline">support@komprice.com</Link></li>
              <li>Phone: [Your Phone Number if applicable]</li>
              <li>Visitor address: [Your Physical Address if applicable]</li>
            </ul>
            <p>We try to respond to feedback within 5 business days.</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Technical Specifications</h2>
            <p>
              Accessibility of Komprice relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
            </p>
            <ul>
              <li>HTML</li>
              <li>WAI-ARIA</li>
              <li>CSS</li>
              <li>JavaScript</li>
            </ul>
            <p>
              These technologies are relied upon for conformance with the accessibility standards used.
            </p>
             <p className="text-sm text-gray-500 mt-4">This statement was created on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
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