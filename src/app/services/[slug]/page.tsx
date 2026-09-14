import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await db.serviceLine.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await db.serviceLine.findUnique({
    where: { slug },
  });

  if (!service || !service.active) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: service.name,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await db.serviceLine.findUnique({
    where: { slug },
  });

  if (!service || !service.active) {
    notFound();
  }

  return (
    <div>
      <PageHeader title={service.name} intro={service.summary} />

      <Section bg="paper">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main details */}
          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-brand-forest">
              Service Overview & Specifications
            </h2>
            <p className="text-brand-forest/90 leading-relaxed text-base">
              {service.details}
            </p>
          </div>

          {/* RFQ Hint Card */}
          <div className="bg-white p-8 rounded-lg border border-brand-green/30 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-brand-green">
              What to include in your RFQ
            </h2>
            <p className="text-sm text-brand-forest/80 leading-relaxed">
              When requesting a quotation for {service.name.toLowerCase()}, please prepare:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-brand-forest/90 pl-2">
              <li>
                <strong className="font-semibold text-brand-forest">Project Scope:</strong> Detailed description of requested items, work specifications, quantity, or maintenance requirements.
              </li>
              <li>
                <strong className="font-semibold text-brand-forest">Site Location:</strong> Delivery or execution facility location (e.g., Port Harcourt, Abuja, offshore, or site address).
              </li>
              <li>
                <strong className="font-semibold text-brand-forest">Desired Start Date:</strong> Expected timeline for mobilization or material delivery.
              </li>
            </ul>
            <div className="pt-4">
              <Link
                href="/quote"
                className="inline-block bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-bold px-6 py-3 rounded text-sm transition-colors border border-brand-gold/40 shadow-sm"
              >
                Submit RFQ
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
