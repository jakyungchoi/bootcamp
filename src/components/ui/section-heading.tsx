export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 whitespace-pre-line text-justify text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
