"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <PageHeader
        title="An Error Occurred"
        intro="An unexpected error occurred while loading this page."
      />

      <Section bg="paper">
        <div className="border-brand-forest/10 mx-auto max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-brand-forest/80 text-base">
            We apologize for the inconvenience. Please try reloading the page or
            return to the main home page.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="bg-brand-green text-brand-paper hover:bg-brand-forest rounded px-5 py-2 text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-brand-paper text-brand-forest hover:bg-brand-forest/10 border-brand-forest/20 rounded border px-5 py-2 text-sm font-semibold transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
