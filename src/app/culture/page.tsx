import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, ImagePlaceholder } from "@/components/ui/card";
import { getCulturePrograms, getPageHeader } from "@/lib/data";

export const metadata: Metadata = {
  title: "교육 문화 | 원티드랩 부트캠프 교육사업",
};

export default async function CulturePage() {
  const [programs, header] = await Promise.all([getCulturePrograms(), getPageHeader("culture")]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      <section className="mt-14 space-y-6">
        {programs.map((program, i) => (
          <Card key={program.id} className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                0{i + 1}
              </p>
              <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                {program.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-neutral-400">{program.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {program.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {program.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <ImagePlaceholder />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
