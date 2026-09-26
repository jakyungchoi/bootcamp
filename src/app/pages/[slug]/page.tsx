import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { getCustomPageBySlug } from "@/lib/data";

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

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
                <p className="mt-2 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
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
