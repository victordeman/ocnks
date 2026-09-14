interface SectionProps {
  children: React.ReactNode;
  className?: string;
  bg?: "paper" | "white" | "forest";
}

export function Section({ children, className = "", bg = "paper" }: SectionProps) {
  const bgClasses = {
    paper: "bg-brand-paper text-brand-forest",
    white: "bg-white text-brand-forest",
    forest: "bg-brand-forest text-brand-paper",
  };

  return (
    <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 ${bgClasses[bg]} ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}
