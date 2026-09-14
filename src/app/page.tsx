export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <section className="bg-brand-green text-brand-paper py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-forest/20 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            OCNKS GLOBAL LTD
          </h1>
          <p className="text-lg sm:text-xl font-medium text-brand-paper/95 max-w-2xl mx-auto leading-relaxed">
            Delivering technical solutions, procurement excellence, and structural reliability across energy, utilities, and infrastructure sectors in Nigeria.
          </p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center p-8 bg-brand-paper">
        <div className="text-center p-8 rounded-lg border border-brand-forest/10 bg-white/50 max-w-md w-full shadow-sm">
          <p className="text-brand-forest font-semibold text-lg tracking-wide">
            Public site launching soon.
          </p>
        </div>
      </section>
    </div>
  );
}
