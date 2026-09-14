import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Health, Safety & Environment (HSE)",
  description:
    "OGL HSE Policy: Zero-accident and zero-tolerance safety target, mandatory site-specific risk assessments, trained personnel, and lawful, ethical operation.",
};

export default function HsePage() {
  return (
    <div>
      <PageHeader
        title="Health, Safety & Environment (HSE) Policy"
        intro="Uncompromising commitment to zero accidents, site safety, and environmental stewardship across all technical operations."
      />

      <Section bg="paper">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-brand-forest">
                Zero-Accident Target & Zero-Tolerance Policy
              </h2>
              <p className="text-brand-forest/90 leading-relaxed text-base">
                At OCNKS GLOBAL LTD, safe performance is integral to project execution. We operate with a strict zero-accident target and maintain zero-tolerance for unsafe practices or disregard of safety procedures on all client and company sites.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-brand-forest/10">
              <h2 className="text-2xl font-bold text-brand-forest">
                Site-Specific Risk Assessment
              </h2>
              <p className="text-brand-forest/90 leading-relaxed text-base">
                Before initiating any supply, engineering, or maintenance task, our team conducts a site-specific risk assessment. Potential hazards are identified, mitigated, and reviewed with site personnel to safeguard workers, community members, and facility infrastructure.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-brand-forest/10">
              <h2 className="text-2xl font-bold text-brand-forest">
                Trained Personnel & Lawful Operations
              </h2>
              <p className="text-brand-forest/90 leading-relaxed text-base">
                All OGL staff receive rigorous safety training appropriate for their technical roles. We strictly uphold ethical, transparent, equitable, and lawful operating standards in total compliance with Nigerian environmental regulations and relevant industry legislation.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-brand-forest text-brand-paper py-12 px-4 text-center border-t border-brand-green/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Safety and Excellence Guaranteed</h2>
          <p className="text-brand-paper/90 text-sm">
            Contact us to request detailed safety protocols for your project site.
          </p>
          <div>
            <Link
              href="/quote"
              className="inline-block bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-bold px-6 py-3 rounded text-sm transition-colors border border-brand-gold/40 shadow-sm"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
