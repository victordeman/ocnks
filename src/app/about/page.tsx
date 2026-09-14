import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about OCNKS GLOBAL LTD, a wholly Nigerian-owned LLC delivering superior technical services with confidentiality, discretion, and direct OEM sourcing.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About OCNKS GLOBAL LTD"
        intro="A wholly Nigerian-owned limited liability company providing superior professional technical services across Nigeria."
      />

      {/* Overview */}
      <Section bg="paper">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg border border-brand-forest/10 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-brand-forest">
            Company Overview
          </h2>
          <p className="text-brand-forest/90 leading-relaxed text-base">
            OCNKS GLOBAL LTD (OGL) is dedicated to delivering superior professional technical services for small-to-large projects in Nigeria. We involve our clients from the beginning, ensuring relevant, meticulous, and cost-effective delivery across all technical and procurement engagements.
          </p>
        </div>
      </Section>

      {/* Vision, Mission, Values */}
      <Section bg="white">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Our Vision, Mission & Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-paper p-6 rounded-lg border border-brand-forest/10 space-y-3">
              <h3 className="text-xl font-bold text-brand-green">Vision</h3>
              <p className="text-sm text-brand-forest/90 leading-relaxed">
                To be the best wholly Nigerian-owned LLC providing superior professional services.
              </p>
            </div>

            <div className="bg-brand-paper p-6 rounded-lg border border-brand-forest/10 space-y-3">
              <h3 className="text-xl font-bold text-brand-green">Mission</h3>
              <p className="text-sm text-brand-forest/90 leading-relaxed">
                To create substantial customer value via quality infrastructure solutions, delivered on time.
              </p>
            </div>

            <div className="bg-brand-paper p-6 rounded-lg border border-brand-forest/10 space-y-3">
              <h3 className="text-xl font-bold text-brand-green">Values</h3>
              <p className="text-sm text-brand-forest/90 leading-relaxed">
                Ethical, transparent, equitable, and lawful conduct in all operations and partnerships.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Ethos & Supply Model */}
      <Section bg="paper">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 space-y-4">
            <h2 className="text-2xl font-bold text-brand-forest">
              Ethos & Service Standards
            </h2>
            <p className="text-brand-forest/90 leading-relaxed text-sm">
              Our operational ethos is built on absolute confidentiality and discretion. We maintain trained, customer-friendly staff who maintain clear communication and meticulous standards on site and across project lifecycles.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 space-y-4">
            <h2 className="text-2xl font-bold text-brand-forest">
              Direct Supply Model
            </h2>
            <p className="text-brand-forest/90 leading-relaxed text-sm">
              We operate a direct producer/source supply model alongside vetted OEM partners. Before selection, every material and component undergoes evaluation for performance, compliance with industry standards, and system interoperability.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-brand-forest text-brand-paper py-12 px-4 text-center border-t border-brand-green/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Work With OCNKS GLOBAL LTD</h2>
          <p className="text-brand-paper/90 text-sm">
            Reach out to our team to request detailed technical proposals or quotations.
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
