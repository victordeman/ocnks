interface PageHeaderProps {
  title: string;
  intro?: string;
  theme?: "green" | "paper";
}

export function PageHeader({ title, intro, theme = "green" }: PageHeaderProps) {
  const isGreen = theme === "green";

  return (
    <header
      className={`border-b px-4 py-12 sm:px-6 lg:px-8 ${
        isGreen
          ? "bg-brand-forest text-brand-paper border-brand-green/20"
          : "text-brand-forest border-brand-forest/10 bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {intro && (
          <p
            className={`max-w-3xl text-lg leading-relaxed sm:text-xl ${
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
