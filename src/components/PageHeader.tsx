interface PageHeaderProps {
  title: string;
  intro?: string;
  theme?: "green" | "paper";
}

export function PageHeader({ title, intro, theme = "green" }: PageHeaderProps) {
  const isGreen = theme === "green";

  return (
    <header
      className={`py-12 px-4 sm:px-6 lg:px-8 border-b ${
        isGreen
          ? "bg-brand-forest text-brand-paper border-brand-green/20"
          : "bg-white text-brand-forest border-brand-forest/10"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>
        {intro && (
          <p
            className={`text-lg sm:text-xl max-w-3xl leading-relaxed ${
              isGreen ? "text-brand-paper/90" : "text-brand-forest/80"
            }`}
          >
            {intro}
          </p>
        )}
      </div>
    </header>
  );
}
