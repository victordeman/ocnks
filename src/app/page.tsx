import Link from "next/link";
import { db } from "@/lib/db";
import { Section } from "@/components/Section";

export const revalidate = 60; // Revalidate dynamic data periodically

export default async function HomePage() {
  const serviceLines = await db.serviceLine.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const markets = [
    {
      name: "Oil & Gas",
      slug: "oil-and-gas",
      summary:
        "Industrial chemicals, consumables, piping, equipment maintenance, and PCII specialist support for onshore and offshore operations.",
    },
    {
      name: "Utilities",
      slug: "utilities",
      summary:
        "Power distribution fittings, transformer installations, generator maintenance, and infrastructure support.",
    },
    {
      name: "Industrial Operations",
      slug: "industrial-operations",
      summary:
        "Heavy structural materials, technical manpower, biohazard decontamination, and plant commissioning services.",
    },
    {
      name: "Built Environment",
      slug: "built-environment",
      summary:
        "Civil building design and delivery, facility renovations, electrical wiring, and professional cleaning support.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-forest text-brand-paper py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-green/30 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Superior Professional Technical Services Across Nigeria
          </h1>
          <p className="text-lg sm:text-xl font-normal text-brand-paper/90 max-w-3xl mx-auto leading-relaxed">
            OCNKS GLOBAL LTD provides relevant, meticulous, and cost-effective delivery for small-to-large projects. We work with clients involved from the beginning to achieve quality technical solutions.
          </p>
          <div className="pt-4">
            <Link
              href="/quote"
              className="inline-block bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-bold px-6 py-3.5 rounded-md text-base transition-colors shadow-md border border-brand-gold/40"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>

      {/* Service Lines Grid */}
      <Section bg="paper">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Our Service Lines
            </h2>
            <p className="text-brand-forest/80 text-base">
              Comprehensive procurement, engineering, and support capabilities tailored to client operational needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceLines.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-lg border border-brand-forest/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-brand-forest">
                    {service.name}
                  </h3>
                  <p className="text-sm text-brand-forest/80 leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-brand-green hover:text-brand-forest transition-colors"
                  >
                    View details
                    <span aria-hidden="true" className="ml-1">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Markets Strip */}
      <Section bg="white">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Markets We Serve
            </h2>
            <p className="text-brand-forest/80 text-base">
              Delivering specialized technical solutions across key economic sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {markets.map((m) => (
              <Link
                key={m.name}
                href="/markets"
                className="block p-6 bg-brand-paper rounded-lg border border-brand-forest/10 hover:border-brand-green/40 transition-colors"
              >
                <h3 className="text-lg font-bold text-brand-forest mb-2">
                  {m.name}
                </h3>
                <p className="text-xs text-brand-forest/80 leading-relaxed">
                  {m.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Why OGL Section */}
      <Section bg="paper">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 space-y-4">
            <h2 className="text-2xl font-bold text-brand-forest">
              Operational Ethos
            </h2>
            <p className="text-brand-forest/80 leading-relaxed text-sm">
              We operate with confidentiality and discretion on every project. Our trained, customer-friendly staff ensure seamless communication and execution, building long-term trust with our partners and clients.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 space-y-4">
            <h2 className="text-2xl font-bold text-brand-forest">
              Direct Supply & OEM Model
            </h2>
            <p className="text-brand-forest/80 leading-relaxed text-sm">
              Our supply model relies on direct relationships with original producers and vetted OEM partners. Before selection, we rigorously evaluate performance, industry standards, and system interoperability.
            </p>
          </div>
        </div>
      </Section>

      {/* Offices Summary Block */}
      <Section bg="white">
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Office Locations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-brand-paper rounded-lg border border-brand-forest/10 space-y-2">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">
                Registered Office
              </span>
              <h3 className="font-bold text-base text-brand-forest">
                Rumuigbo, Port Harcourt
              </h3>
              <p className="text-xs text-brand-forest/80">
                19 Obi Wali Street, Rumuigbo, Port Harcourt, Rivers State
              </p>
            </div>

            <div className="p-6 bg-brand-paper rounded-lg border border-brand-forest/10 space-y-2">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">
                Corporate Office
              </span>
              <h3 className="font-bold text-base text-brand-forest">
                D/Line, Port Harcourt
              </h3>
              <p className="text-xs text-brand-forest/80">
                14 Khana Street, D/Line, Port Harcourt, Rivers State
              </p>
            </div>

            <div className="p-6 bg-brand-paper rounded-lg border border-brand-forest/10 space-y-2">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">
                Abuja Base
              </span>
              <h3 className="font-bold text-base text-brand-forest">
                Dawaki, Abuja
              </h3>
              <p className="text-xs text-brand-forest/80">
                3 Olusegun Soyemi Street, Dawaki, Abuja, FCT
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Closing CTA Band */}
      <section className="bg-brand-forest text-brand-paper py-12 px-4 sm:px-6 lg:px-8 text-center border-t border-brand-green/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to Discuss Your Project Requirements?
          </h2>
          <p className="text-brand-paper/90 text-base">
            Contact our engineering and procurement team for cost-effective technical solutions tailored to your operational targets.
          </p>
          <div className="pt-2">
            <Link
              href="/quote"
              className="inline-block bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-bold px-6 py-3 rounded-md text-base transition-colors shadow-md border border-brand-gold/40"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
