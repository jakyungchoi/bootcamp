import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ProgramPhotoSlider } from "@/components/culture/program-photo-slider";
import { getCulturePrograms, getPageHeader } from "@/lib/data";

export const metadata: Metadata = {
  title: "교육 문화 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

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
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
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
              <ProgramPhotoSlider photos={program.photos} />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
