import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with OCNKS GLOBAL LTD. Registered Office in Rumuigbo, Corporate Office in D/Line Port Harcourt, and Abuja Base in Dawaki.",
};

export default function ContactPage() {
  const offices = [
    {
      title: "Registered Office — Rumuigbo",
      location: "Port Harcourt, Rivers State",
      address: "19 Obi Wali Street, Rumuigbo, Port Harcourt, Rivers State",
    },
    {
      title: "Corporate Office — D/Line",
      location: "Port Harcourt, Rivers State",
      address: "14 Khana Street, D/Line, Port Harcourt, Rivers State",
    },
    {
      title: "Abuja Base — Dawaki",
      location: "Abuja, FCT",
      address: "3 Olusegun Soyemi Street, Dawaki, Abuja, FCT",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contact OCNKS GLOBAL LTD"
        intro="Reach out to our offices in Port Harcourt and Abuja for inquiries, technical consultations, and service requests."
      />

      <Section bg="paper">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Office Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((off) => (
              <div
                key={off.title}
                className="bg-white p-6 rounded-lg border border-brand-forest/10 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-brand-green">
                    {off.title}
                  </h2>
                  <address className="not-italic text-sm text-brand-forest/90 leading-relaxed">
                    {off.address}
                  </address>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Communication Channels */}
          <div className="bg-white p-8 rounded-lg border border-brand-forest/10 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-brand-forest">
              Direct Contact Channels
            </h2>
            <div className="space-y-4 text-base">
              <p>
                <span className="font-semibold text-brand-forest">Phone (All Sites):</span>{" "}
                <a
                  href="tel:+2348108690772"
                  className="text-brand-green font-bold hover:underline"
                >
                  +234 810 869 0772
                </a>
              </p>
              <p>
                <span className="font-semibold text-brand-forest">Email:</span>{" "}
                <a
                  href="mailto:ocnksglobal@gmail.com"
                  className="text-brand-green font-bold hover:underline"
                >
                  ocnksglobal@gmail.com
                </a>
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/quote"
                className="inline-block bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-bold px-6 py-3 rounded text-sm transition-colors border border-brand-gold/40 shadow-sm"
              >
                Request a quotation
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
