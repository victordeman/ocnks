import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export default function NotFound() {
  return (
    <div>
      <PageHeader
        title="Page Not Found"
        intro="The page you are looking for could not be found."
      />

      <Section bg="paper">
        <div className="border-brand-forest/10 mx-auto max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-brand-forest/80 text-base">
            Please check the URL or navigate back to the home page to explore
            our services and company information.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="bg-brand-green text-brand-paper hover:bg-brand-forest inline-block rounded px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
