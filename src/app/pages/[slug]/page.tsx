import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { getCustomPageBySlug } from "@/lib/data";

export default async function CustomPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);

  if (!page) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={page.eyebrow || undefined} title={page.title} description={page.description || undefined} />

      {page.sections.length > 0 && (
        <section className="mt-14 grid gap-5 sm:grid-cols-2">
          {page.sections.map((section, idx) => (
            <Card key={idx}>
              {section.heading && (
                <p className="font-bold text-neutral-900 dark:text-white">{section.heading}</p>
              )}
              {section.body && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {section.body}
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
