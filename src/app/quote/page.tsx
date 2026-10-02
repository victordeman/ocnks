import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Request a Quotation",
  description:
    "Request a quotation from OCNKS GLOBAL LTD. Direct email and phone contact details while our online RFQ portal is being prepared.",
};

export default function QuotePage() {
  return (
    <div>
      <PageHeader
        title="Request a Quotation"
        intro="Our online quotation request form is currently being prepared for deployment."
      />

      <Section bg="paper">
        <div className="border-brand-forest/10 mx-auto max-w-2xl space-y-6 rounded-lg border bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="bg-brand-green/10 text-brand-green mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
            OG
          </div>

          <div className="space-y-3">
            <h2 className="text-brand-forest text-2xl font-bold">
              Quotation Portal Under Preparation
            </h2>
            <p className="text-brand-forest/80 text-sm leading-relaxed">
              We are finalizing our online RFQ submission system to streamline
              your quotation workflow. In the meantime, please submit your
              project specifications, location, and requirements directly to our
              contact channels below:
            </p>
          </div>

          <div className="bg-brand-paper border-brand-forest/10 space-y-3 rounded-lg border p-6 text-left sm:text-center">
            <p className="text-sm">
              <strong className="text-brand-forest font-semibold">
                Email:
              </strong>{" "}
              <a
                href="mailto:ocnksglobal@gmail.com"
                className="text-brand-green font-bold hover:underline"
              >
                ocnksglobal@gmail.com
              </a>
            </p>
            <p className="text-sm">
              <strong className="text-brand-forest font-semibold">
                Phone (All Sites):
              </strong>{" "}
              <a
                href="tel:+2348108690772"
                className="text-brand-green font-bold hover:underline"
              >
                +234 810 869 0772
              </a>
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/services"
              className="bg-brand-green text-brand-paper hover:bg-brand-forest inline-block rounded px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Browse Service Catalogue
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
