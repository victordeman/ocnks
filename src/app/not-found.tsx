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
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-brand-forest/10 shadow-sm text-center space-y-4">
          <p className="text-brand-forest/80 text-base">
            Please check the URL or navigate back to the home page to explore our services and company information.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block bg-brand-green text-brand-paper hover:bg-brand-forest font-semibold px-6 py-2.5 rounded text-sm transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
