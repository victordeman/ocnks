import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Service Catalogue",
  description:
    "Explore OCNKS GLOBAL LTD's service lines: supplies, procurement, civil, electrical, mechanical engineering, support services, manpower development, general contract, and specialist technical services.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  type ServiceLineItem = Awaited<
    ReturnType<typeof db.serviceLine.findMany>
  >[number];
  let serviceLines: ServiceLineItem[] = [];

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

  return (
    <div>
      <PageHeader
        title="Service Catalogue"
        intro="Explore our active service lines across procurement, engineering, support, and technical integration."
      />

      <Section bg="paper">
        {serviceLines.length === 0 ? (
          <div className="border-brand-forest/10 mx-auto max-w-lg space-y-4 rounded-lg border bg-white p-8 py-12 text-center">
            <p className="text-brand-forest/80 font-medium">
              Our service catalogue is currently being updated. Please contact
              us directly for immediate inquiries.
            </p>
            <div>
              <Link
                href="/contact"
                className="bg-brand-green text-brand-paper hover:bg-brand-forest inline-block rounded px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceLines.map((service) => (
              <div
                key={service.id}
                className="border-brand-forest/10 flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-3">
                  <h2 className="text-brand-forest text-xl font-bold">
                    {service.name}
                  </h2>
                  <p className="text-brand-forest/80 text-sm leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-brand-green hover:text-brand-forest inline-flex items-center text-sm font-semibold transition-colors"
                  >
                    View details & RFQ hint
                    <span aria-hidden="true" className="ml-1">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <section className="bg-brand-forest text-brand-paper border-brand-green/30 border-t px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold">Need a Custom Service Package?</h2>
          <p className="text-brand-paper/90 text-sm">
            We combine supply, procurement, and engineering capabilities under a
            single accountable structure.
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
