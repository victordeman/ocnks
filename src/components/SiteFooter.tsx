import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-forest text-brand-paper/90 border-brand-green/30 border-t pt-12 pb-8">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Registered Office */}
          <div className="space-y-3">
            <h2 className="text-brand-gold text-sm font-bold tracking-wider uppercase">
              Registered Office — Rumuigbo
            </h2>
            <address className="text-brand-paper/80 text-sm leading-relaxed not-italic">
              19 Obi Wali Street, Rumuigbo, Port Harcourt, Rivers State
            </address>
          </div>

          {/* Corporate Office */}
          <div className="space-y-3">
            <h2 className="text-brand-gold text-sm font-bold tracking-wider uppercase">
              Corporate Office — D/Line
            </h2>
            <address className="text-brand-paper/80 text-sm leading-relaxed not-italic">
              14 Khana Street, D/Line, Port Harcourt, Rivers State
            </address>
          </div>

          {/* Abuja Base */}
          <div className="space-y-3">
            <h2 className="text-brand-gold text-sm font-bold tracking-wider uppercase">
              Abuja Base — Dawaki
            </h2>
            <address className="text-brand-paper/80 text-sm leading-relaxed not-italic">
              3 Olusegun Soyemi Street, Dawaki, Abuja, FCT
            </address>
          </div>

          {/* Contact & Quick Links */}
          <div className="space-y-3">
            <h2 className="text-brand-gold text-sm font-bold tracking-wider uppercase">
              Contact & Quick Links
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-brand-paper font-medium">Phone:</span>{" "}
                <a
                  href="tel:+2348108690772"
                  className="hover:text-brand-gold underline underline-offset-2 transition-colors"
                >
                  +234 810 869 0772
                </a>
              </p>
              <p>
                <span className="text-brand-paper font-medium">Email:</span>{" "}
                <a
                  href="mailto:ocnksglobal@gmail.com"
                  className="hover:text-brand-gold underline underline-offset-2 transition-colors"
                >
                  ocnksglobal@gmail.com
                </a>
              </p>
            </div>
            <nav className="text-brand-paper/75 flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs">
              <Link
                href="/about"
                className="hover:text-brand-gold transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/services"
                className="hover:text-brand-gold transition-colors"
              >
                Services
              </Link>
              <Link
                href="/markets"
                className="hover:text-brand-gold transition-colors"
              >
                Markets
              </Link>
              <Link
                href="/hse"
                className="hover:text-brand-gold transition-colors"
              >
                HSE Policy
              </Link>
              <Link
                href="/contact"
                className="hover:text-brand-gold transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/quote"
                className="hover:text-brand-gold transition-colors"
              >
                Request Quote
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-brand-paper/10 text-brand-paper/60 border-t pt-6 text-center text-xs">
          <p>&copy; {currentYear} OCNKS GLOBAL LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
