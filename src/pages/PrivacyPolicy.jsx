import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-6 sm:px-12 lg:px-20 pt-6 pb-24 max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">
            Legal & Compliance
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-900 uppercase">
            PRIVACY POLICY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pt-2">
            Effective Date: October 2026. At AURA, we value your trust and are committed to protecting your personal information with absolute discretion and uncompromising security standards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-neutral-700">
              <FileText className="h-3.5 w-3.5 text-neutral-900" />
              Policy overview
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-neutral-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-900" />
              GDPR & CCPA aligned
            </div>
          </div>
        </section>

        {/* Key Guarantees Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-neutral-200 py-8 text-left">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Encrypted Payments</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">PCI-DSS Level 1 compliant Stripe processing. No card data saved.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">No Third-Party Sale</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">We never monetize, rent, or trade your personal details to brokers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Full Transparency</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">Request, export, or delete your account data anytime upon request.</p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-12 text-left text-xs sm:text-sm text-neutral-700 font-light leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">01.</span>
              Information We Collect
            </h2>
            <p>
              When you interact with the AURA digital atelier, browse our collections, create an account, or complete an acquisition, we collect the necessary information to provide you with seamless service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Contact & Identification Details:</strong> Your name, email address, telephone contact, and country of residence.</li>
              <li><strong>Delivery & Shipping Records:</strong> Full physical destination address, postal code, and specific courier delivery instructions.</li>
              <li><strong>Account Credentials:</strong> Securely hashed passwords and authentication tokens (if you maintain a registered member profile).</li>
              <li><strong>Technical & Session Data:</strong> IP address, browser type, device information, and anonymous session analytics to optimize site performance.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">02.</span>
              Payment Security & Stripe Integration
            </h2>
            <p>
              We prioritize the highest industry standards for financial transactions. All credit card, debit card, and digital payment transactions are conducted directly through <strong>Stripe Inc.</strong>, a certified PCI Service Provider Level 1.
            </p>
            <p>
              <strong>AURA servers never see, store, or transmit your unencrypted credit card number, CVV code, or banking credentials.</strong> All sensitive payment elements are tokenized directly within Stripe's sandboxed infrastructure.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">03.</span>
              How We Use Your Information
            </h2>
            <p>
              Your data is collected strictly for lawful purposes essential to our relationship with you:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Processing, fulfilling, and dispatching orders placed through our shop and lookbook.</li>
              <li>Providing real-time tracking numbers and electronic receipts.</li>
              <li>Responding to bespoke inquiries, sizing guidance, and atelier support requests.</li>
              <li>Dispatching curated editorial releases, private lookbook drops, and promotional communications (only with your explicit opt-in consent).</li>
              <li>Detecting, preventing, and mitigating fraudulent transactions or unauthorized account activity.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">04.</span>
              Cookies & Local Storage
            </h2>
            <p>
              Our website utilizes minimal, essential session technologies (such as browser local storage and cookies) solely to retain your shopping bag items, manage your authenticated profile session, and preserve your curated wishlist preferences across page reloads. We do not deploy invasive third-party cross-site behavioral tracking scripts.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">05.</span>
              Data Retention & Your Rights
            </h2>
            <p>
              Under global data privacy frameworks (including GDPR and CCPA principles), you retain full sovereignty over your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li><strong>Right of Access:</strong> You may request an export of all personal data we hold associated with your email.</li>
              <li><strong>Right to Rectification:</strong> You can update or amend inaccurate contact and address details at any time via your account dashboard.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You may request permanent deletion of your profile and historical records, subject to statutory tax and auditing requirements.</li>
              <li><strong>Unsubscribe:</strong> Every editorial newsletter includes a one-click unsubscribe mechanism to immediately discontinue communications.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">06.</span>
              Contact Our Privacy Concierge
            </h2>
            <p>
              If you have any questions regarding this Privacy Policy, your data rights, or our security protocols, please reach out to our legal team:
            </p>
            <div className="bg-neutral-100 p-4 rounded-xs border border-neutral-200 mt-2 space-y-1">
              <p className="font-medium text-neutral-900">AURA Luxury Studio — Data Protection Office</p>
              <p className="text-neutral-600">Email: <a href="mailto:privacy@aurastudio.com" className="text-neutral-900 underline hover:opacity-75">privacy@aurastudio.com</a></p>
              <p className="text-neutral-600">Direct Inquiries: <Link to="/contact" className="text-neutral-900 underline hover:opacity-75">Contact Us Page</Link></p>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
