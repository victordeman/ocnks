import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const services = await db.serviceLine.findMany({
      where: { active: true },
      select: { slug: true },
    });
    return services.map((service) => ({
      slug: service.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  if (!process.env.DATABASE_URL) {
    return {
      title: "Service Details",
    };
  }

  try {
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
  } catch {
    return {
      title: "Service Details",
    };
  }
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
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Main details */}
          <div className="border-brand-forest/10 space-y-4 rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="text-brand-forest text-2xl font-bold">
              Service Overview & Specifications
            </h2>
            <p className="text-brand-forest/90 text-base leading-relaxed">
              {service.details}
            </p>
          </div>

          {/* RFQ Hint Card */}
          <div className="border-brand-green/30 space-y-4 rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="text-brand-green text-xl font-bold">
              What to include in your RFQ
            </h2>
            <p className="text-brand-forest/80 text-sm leading-relaxed">
              When requesting a quotation for {service.name.toLowerCase()},
              please prepare:
            </p>
            <ul className="text-brand-forest/90 list-inside list-disc space-y-2 pl-2 text-sm">
              <li>
                <strong className="text-brand-forest font-semibold">
                  Project Scope:
                </strong>{" "}
                Detailed description of requested items, work specifications,
                quantity, or maintenance requirements.
              </li>
              <li>
                <strong className="text-brand-forest font-semibold">
                  Site Location:
                </strong>{" "}
                Delivery or execution facility location (e.g., Port Harcourt,
                Abuja, offshore, or site address).
              </li>
              <li>
                <strong className="text-brand-forest font-semibold">
                  Desired Start Date:
                </strong>{" "}
                Expected timeline for mobilization or material delivery.
              </li>
            </ul>
            <div className="pt-4">
              <Link
                href="/quote"
                className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 inline-block rounded border px-6 py-3 text-sm font-bold shadow-sm transition-colors"
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
