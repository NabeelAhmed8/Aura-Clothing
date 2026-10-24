import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, PackageCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="pt-2 bg-[#F9F9F8] flex-1 flex flex-col text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-6 sm:px-12 lg:px-20 pt-6 pb-24 max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">
            Agreements & Conditions
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-900 uppercase">
            TERMS OF SERVICE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pt-2">
            Effective Date: October 2026. Please read these terms carefully before accessing our boutique or acquiring pieces from the AURA collections.
          </p>
        </section>

        {/* Key Guarantees Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 border-y border-neutral-200 py-8 text-left">
          <div className="flex items-start gap-3">
            <PackageCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Guaranteed Authenticity</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">Every garment is 100% original, crafted with certified atelier materials.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Exchange Window</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">14-day exchange privilege for unworn items with original security tags.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Transparent Pricing</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">No hidden surcharges. All currency rates displayed clearly at checkout.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900">Important Notice</h4>
              <p className="text-[11px] text-neutral-500 font-light mt-1">Please review all care instructions, customs requirements, and order details before final confirmation.</p>
            </div>
          </div>
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-12 text-left text-xs sm:text-sm text-neutral-700 font-light leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">01.</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing through this website (owned and operated by AURA Studio), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, along with our <Link to="/privacy-policy" className="text-neutral-900 underline hover:opacity-75">Privacy Policy</Link>. If you do not agree to all provisions, you must refrain from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">02.</span>
              Products, Pricing & Inventory Availability
            </h2>
            <p>
              All prices shown on our website are denominated in US Dollars (USD) unless otherwise stated. While we make every endeavor to present true fabric colors, drape, and textural fidelity, screen monitor calibrations may cause subtle variations.
            </p>
            <p>
              AURA items are produced in curated, limited quantities. We reserve the right to revise product specifications, withdraw discontinued pieces, and update retail prices without prior announcement. In the rare event an acquired garment is found to be out of stock post-purchase, our concierge will issue an immediate 100% full refund.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">03.</span>
              Orders & Payment Authorization
            </h2>
            <p>
              Submission of an order through our checkout constitutes a binding purchase offer. An automated confirmation email does not guarantee acceptance until inventory reservation and payment clearance are verified.
            </p>
            <p>
              We accept international debit/credit cards processed securely via <strong>Stripe</strong>. By submitting payment credentials, you affirm that you are the lawful owner or authorized representative of the chosen payment method and authorize AURA to charge the total verified order amount.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">04.</span>
              Shipping & Transit Responsibility
            </h2>
            <p>
              Orders are dispatched via trusted insured courier partners. Standard transit timelines range between 3 to 7 business days, depending on geographic territory. Tracking numbers are transmitted to your registered email immediately upon package handoff.
            </p>
            <p>
              For international shipments, customs tariffs, import taxes, or cross-border clearance duties levied by destination jurisdiction are the responsibility of the purchaser.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">05.</span>
              Returns, Exchanges & Refund Policy
            </h2>
            <p>
              We strive for complete satisfaction with every acquisition. You may request an exchange or return within <strong>14 calendar days</strong> of receiving your shipment under the following criteria:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
              <li>Garments must remain in original, unworn, unwashed, and unaltered condition.</li>
              <li>All original AURA luxury garment tags, fabric swatches, and packaging must remain fully intact.</li>
              <li>Sale or final-archive promotional pieces may be eligible for store credit only.</li>
            </ul>
            <p>
              Approved refunds are credited back to the original payment method through Stripe within 5 to 10 banking business days following atelier inspection.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">06.</span>
              Intellectual Property Rights
            </h2>
            <p>
              All trademarks, collection names, visual imagery, editorial lookbooks, garment blueprints, logos, and digital code featured on this site are the exclusive intellectual property of AURA Luxury Studio. Any unauthorized duplication, commercial re-use, reproduction, or reverse-engineering is strictly prohibited by international copyright laws.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-neutral-200 pt-8">
            <h2 className="text-base sm:text-lg uppercase tracking-wider font-semibold text-neutral-900 flex items-center gap-2">
              <span className="text-neutral-400 font-mono text-xs">07.</span>
              Legal Governance & Atelier Contact
            </h2>
            <p>
              These Terms shall be interpreted and governed in accordance with international commercial law. For contractual inquiries, legal notices, or customer assistance, please reach out directly:
            </p>
            <div className="bg-neutral-100 p-4 rounded-xs border border-neutral-200 mt-2 space-y-1">
              <p className="font-medium text-neutral-900">AURA Luxury Studio — Legal Department</p>
              <p className="text-neutral-600">Email: <a href="mailto:legal@aurastudio.com" className="text-neutral-900 underline hover:opacity-75">legal@aurastudio.com</a></p>
              <p className="text-neutral-600">Customer Support: <Link to="/contact" className="text-neutral-900 underline hover:opacity-75">Visit Contact Page</Link></p>
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
