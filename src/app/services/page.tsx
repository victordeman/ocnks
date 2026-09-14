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

export const revalidate = 60;

export default async function ServicesPage() {
  const serviceLines = await db.serviceLine.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Service Catalogue"
        intro="Explore our active service lines across procurement, engineering, support, and technical integration."
      />

      <Section bg="paper">
        {serviceLines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-brand-forest/10 p-8 space-y-4 max-w-lg mx-auto">
            <p className="text-brand-forest/80 font-medium">
              Our service catalogue is currently being updated. Please contact us directly for immediate inquiries.
            </p>
            <div>
              <Link
                href="/contact"
                className="inline-block bg-brand-green text-brand-paper hover:bg-brand-forest font-semibold px-5 py-2.5 rounded text-sm transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceLines.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-lg border border-brand-forest/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-brand-forest">
                    {service.name}
                  </h2>
                  <p className="text-sm text-brand-forest/80 leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-brand-green hover:text-brand-forest transition-colors"
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

      <section className="bg-brand-forest text-brand-paper py-12 px-4 text-center border-t border-brand-green/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Need a Custom Service Package?</h2>
          <p className="text-brand-paper/90 text-sm">
            We combine supply, procurement, and engineering capabilities under a single accountable structure.
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
