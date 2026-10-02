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
        <div className="border-brand-forest/10 mx-auto max-w-4xl space-y-4 rounded-lg border bg-white p-8 shadow-sm">
          <h2 className="text-brand-forest text-2xl font-bold">
            Company Overview
          </h2>
          <p className="text-brand-forest/90 text-base leading-relaxed">
            OCNKS GLOBAL LTD (OGL) is dedicated to delivering superior
            professional technical services for small-to-large projects in
            Nigeria. We involve our clients from the beginning, ensuring
            relevant, meticulous, and cost-effective delivery across all
            technical and procurement engagements.
          </p>
        </div>
      </Section>

      {/* Vision, Mission, Values */}
      <Section bg="white">
        <div className="space-y-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Our Vision, Mission & Values
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-brand-paper border-brand-forest/10 space-y-3 rounded-lg border p-6">
              <h3 className="text-brand-green text-xl font-bold">Vision</h3>
              <p className="text-brand-forest/90 text-sm leading-relaxed">
                To be the best wholly Nigerian-owned LLC providing superior
                professional services.
              </p>
            </div>

            <div className="bg-brand-paper border-brand-forest/10 space-y-3 rounded-lg border p-6">
              <h3 className="text-brand-green text-xl font-bold">Mission</h3>
              <p className="text-brand-forest/90 text-sm leading-relaxed">
                To create substantial customer value via quality infrastructure
                solutions, delivered on time.
              </p>
            </div>

            <div className="bg-brand-paper border-brand-forest/10 space-y-3 rounded-lg border p-6">
              <h3 className="text-brand-green text-xl font-bold">Values</h3>
              <p className="text-brand-forest/90 text-sm leading-relaxed">
                Ethical, transparent, equitable, and lawful conduct in all
                operations and partnerships.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Ethos & Supply Model */}
      <Section bg="paper">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8">
            <h2 className="text-brand-forest text-2xl font-bold">
              Ethos & Service Standards
            </h2>
            <p className="text-brand-forest/90 text-sm leading-relaxed">
              Our operational ethos is built on absolute confidentiality and
              discretion. We maintain trained, customer-friendly staff who
              maintain clear communication and meticulous standards on site and
              across project lifecycles.
            </p>
          </div>

          <div className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8">
            <h2 className="text-brand-forest text-2xl font-bold">
              Direct Supply Model
            </h2>
            <p className="text-brand-forest/90 text-sm leading-relaxed">
              We operate a direct producer/source supply model alongside vetted
              OEM partners. Before selection, every material and component
              undergoes evaluation for performance, compliance with industry
              standards, and system interoperability.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-brand-forest text-brand-paper border-brand-green/30 border-t px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">Work With OCNKS GLOBAL LTD</h2>
          <p className="text-brand-paper/90 text-sm">
            Reach out to our team to request detailed technical proposals or
            quotations.
          </p>
          <div>
            <Link
              href="/quote"
              className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 inline-block rounded border px-6 py-3 text-sm font-bold shadow-sm transition-colors"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
