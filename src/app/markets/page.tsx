import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Markets Served",
  description:
    "Discover how OCNKS GLOBAL LTD serves key industry markets including Oil & Gas, Utilities, Industrial Operations, and the Built Environment.",
};

export default function MarketsPage() {
  const marketDetails = [
    {
      id: "oil-and-gas",
      name: "Oil & Gas",
      description:
        "OCNKS GLOBAL LTD provides critical technical support to onshore and offshore oil & gas facilities in Nigeria. We supply industrial and drilling chemicals, quality structural materials, and replacement parts sourced directly from OEM partners. Furthermore, our engineering teams assist with biohazard decontamination, industrial cleaning, and process control and instrumentation infrastructure (PCII) maintenance.",
    },
    {
      id: "utilities",
      name: "Utilities",
      description:
        "We deliver technical solutions for power distribution networks, municipal water facilities, and public infrastructure providers. Our teams handle the procurement, installation, and routine maintenance of high-capacity transformers, electrical fittings, industrial generators, and structural support frameworks to ensure uninterrupted operational uptime.",
    },
    {
      id: "industrial-operations",
      name: "Industrial Operations",
      description:
        "For manufacturing plants, processing facilities, and heavy industrial sites, OGL offers general contracting, equipment overhaul, and specialized manpower services. We supply industrial consumables, perform site-specific risk assessments, and commission critical ICT and control software upgrades designed to maximize plant productivity.",
    },
    {
      id: "built-environment",
      name: "Built Environment",
      description:
        "In commercial construction, corporate office buildings, and residential facilities, OGL delivers groundwork-to-handover civil engineering, structural renovations, complete electrical cabling, and ongoing support services. Our trained staff deliver professional cleaning and site launderette operations tailored for facilities and worker camps.",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Markets We Serve"
        intro="Tailored technical capabilities aligned with sector-specific operational standards and safety requirements."
      />

      <Section bg="paper">
        <div className="mx-auto max-w-4xl space-y-8">
          {marketDetails.map((market) => (
            <div
              key={market.id}
              id={market.id}
              className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8 shadow-sm"
            >
              <h2 className="text-brand-forest text-2xl font-bold">
                {market.name}
              </h2>
              <p className="text-brand-forest/90 text-base leading-relaxed">
                {market.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-brand-forest text-brand-paper border-brand-green/30 border-t px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">
            Have a Project in These Sectors?
          </h2>
          <p className="text-brand-paper/90 text-sm">
            Partner with OGL for meticulous, cost-effective service delivery.
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
