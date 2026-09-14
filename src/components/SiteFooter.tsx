import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-forest text-brand-paper/90 border-t border-brand-green/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Registered Office */}
          <div className="space-y-3">
            <h2 className="text-brand-gold font-bold text-sm tracking-wider uppercase">
              Registered Office — Rumuigbo
            </h2>
            <address className="not-italic text-sm leading-relaxed text-brand-paper/80">
              19 Obi Wali Street, Rumuigbo, Port Harcourt, Rivers State
            </address>
          </div>

          {/* Corporate Office */}
          <div className="space-y-3">
            <h2 className="text-brand-gold font-bold text-sm tracking-wider uppercase">
              Corporate Office — D/Line
            </h2>
            <address className="not-italic text-sm leading-relaxed text-brand-paper/80">
              14 Khana Street, D/Line, Port Harcourt, Rivers State
            </address>
          </div>

          {/* Abuja Base */}
          <div className="space-y-3">
            <h2 className="text-brand-gold font-bold text-sm tracking-wider uppercase">
              Abuja Base — Dawaki
            </h2>
            <address className="not-italic text-sm leading-relaxed text-brand-paper/80">
              3 Olusegun Soyemi Street, Dawaki, Abuja, FCT
            </address>
          </div>

          {/* Contact & Quick Links */}
          <div className="space-y-3">
            <h2 className="text-brand-gold font-bold text-sm tracking-wider uppercase">
              Contact & Quick Links
            </h2>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium text-brand-paper">Phone:</span>{" "}
                <a
                  href="tel:+2348108690772"
                  className="hover:text-brand-gold transition-colors underline underline-offset-2"
                >
                  +234 810 869 0772
                </a>
              </p>
              <p>
                <span className="font-medium text-brand-paper">Email:</span>{" "}
                <a
                  href="mailto:ocnksglobal@gmail.com"
                  className="hover:text-brand-gold transition-colors underline underline-offset-2"
                >
                  ocnksglobal@gmail.com
                </a>
              </p>
            </div>
            <nav className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-paper/75">
              <Link href="/about" className="hover:text-brand-gold transition-colors">
                About Us
              </Link>
              <Link href="/services" className="hover:text-brand-gold transition-colors">
                Services
              </Link>
              <Link href="/markets" className="hover:text-brand-gold transition-colors">
                Markets
              </Link>
              <Link href="/hse" className="hover:text-brand-gold transition-colors">
                HSE Policy
              </Link>
              <Link href="/contact" className="hover:text-brand-gold transition-colors">
                Contact
              </Link>
              <Link href="/quote" className="hover:text-brand-gold transition-colors">
                Request Quote
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-brand-paper/10 pt-6 text-center text-xs text-brand-paper/60">
          <p>&copy; {currentYear} OCNKS GLOBAL LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
