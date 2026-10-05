import Link from "next/link";
import { db } from "@/lib/db";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let serviceLines: Array<{
    id: string;
    name: string;
    slug: string;
    summary: string;
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      serviceLines = await db.serviceLine.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      serviceLines = [];
    }
  }

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
      <section className="bg-brand-forest text-brand-paper border-brand-green/30 border-b px-4 py-16 shadow-inner sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Superior Professional Technical Services Across Nigeria
          </h1>
          <p className="text-brand-paper/90 mx-auto max-w-3xl text-lg leading-relaxed font-normal sm:text-xl">
            OCNKS GLOBAL LTD provides relevant, meticulous, and cost-effective
            delivery for small-to-large projects. We work with clients involved
            from the beginning to achieve quality technical solutions.
          </p>
          <div className="pt-4">
            <Link
              href="/quote"
              className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 inline-block rounded-md border px-6 py-3.5 text-base font-bold shadow-md transition-colors"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>

      {/* Service Lines Grid */}
      <Section bg="paper">
        <div className="space-y-8">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Our Service Lines
            </h2>
            <p className="text-brand-forest/80 text-base">
              Comprehensive procurement, engineering, and support capabilities
              tailored to client operational needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceLines.map((service) => (
              <div
                key={service.id}
                className="border-brand-forest/10 flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-3">
                  <h3 className="text-brand-forest text-xl font-bold">
                    {service.name}
                  </h3>
                  <p className="text-brand-forest/80 text-sm leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-brand-green hover:text-brand-forest inline-flex items-center text-sm font-semibold transition-colors"
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
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Markets We Serve
            </h2>
            <p className="text-brand-forest/80 text-base">
              Delivering specialized technical solutions across key economic
              sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {markets.map((m) => (
              <Link
                key={m.name}
                href="/markets"
                className="bg-brand-paper border-brand-forest/10 hover:border-brand-green/40 block rounded-lg border p-6 transition-colors"
              >
                <h3 className="text-brand-forest mb-2 text-lg font-bold">
                  {m.name}
                </h3>
                <p className="text-brand-forest/80 text-xs leading-relaxed">
                  {m.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Why OGL Section */}
      <Section bg="paper">
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          <div className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8">
            <h2 className="text-brand-forest text-2xl font-bold">
              Operational Ethos
            </h2>
            <p className="text-brand-forest/80 text-sm leading-relaxed">
              We operate with confidentiality and discretion on every project.
              Our trained, customer-friendly staff ensure seamless communication
              and execution, building long-term trust with our partners and
              clients.
            </p>
          </div>

          <div className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8">
            <h2 className="text-brand-forest text-2xl font-bold">
              Direct Supply & OEM Model
            </h2>
            <p className="text-brand-forest/80 text-sm leading-relaxed">
              Our supply model relies on direct relationships with original
              producers and vetted OEM partners. Before selection, we rigorously
              evaluate performance, industry standards, and system
              interoperability.
            </p>
          </div>
        </div>
      </Section>

      {/* Offices Summary Block */}
      <Section bg="white">
        <div className="space-y-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Office Locations
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-brand-paper border-brand-forest/10 space-y-2 rounded-lg border p-6">
              <span className="text-brand-green block text-xs font-bold tracking-wider uppercase">
                Registered Office
              </span>
              <h3 className="text-brand-forest text-base font-bold">
                Rumuigbo, Port Harcourt
              </h3>
              <p className="text-brand-forest/80 text-xs">
                19 Obi Wali Street, Rumuigbo, Port Harcourt, Rivers State
              </p>
            </div>

            <div className="bg-brand-paper border-brand-forest/10 space-y-2 rounded-lg border p-6">
              <span className="text-brand-green block text-xs font-bold tracking-wider uppercase">
                Corporate Office
              </span>
              <h3 className="text-brand-forest text-base font-bold">
                D/Line, Port Harcourt
              </h3>
              <p className="text-brand-forest/80 text-xs">
                14 Khana Street, D/Line, Port Harcourt, Rivers State
              </p>
            </div>

            <div className="bg-brand-paper border-brand-paper border-brand-forest/10 space-y-2 rounded-lg border p-6">
              <span className="text-brand-green block text-xs font-bold tracking-wider uppercase">
                Abuja Base
              </span>
              <h3 className="text-brand-forest text-base font-bold">
                Dawaki, Abuja
              </h3>
              <p className="text-brand-forest/80 text-xs">
                3 Olusegun Soyemi Street, Dawaki, Abuja, FCT
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Closing CTA Band */}
      <section className="bg-brand-forest text-brand-paper border-brand-green/30 border-t px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Discuss Your Project Requirements?
          </h2>
          <p className="text-brand-paper/90 text-base">
            Contact our engineering and procurement team for cost-effective
            technical solutions tailored to your operational targets.
          </p>
          <div className="pt-2">
            <Link
              href="/quote"
              className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 inline-block rounded-md border px-6 py-3 text-base font-bold shadow-md transition-colors"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
