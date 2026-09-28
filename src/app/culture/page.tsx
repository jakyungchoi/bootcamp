import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ProgramPhotoSlider } from "@/components/culture/program-photo-slider";
import { getAdminMenuLabels, getCulturePrograms, getHiddenAdminKeys, getPageHeader, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "교육 문화 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

export default async function CulturePage() {
  const [programs, header, settings, hiddenKeys, labels] = await Promise.all([
    getCulturePrograms(),
    getPageHeader("culture"),
    getSiteSettings(),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
  ]);
  // 관리자 대시보드에서 "오프라인 교육장"을 숨기기 하면 이 블록도 통째로 감춘다. 이름을 바꾸면
  // 아래 제목도 그 이름을 따라간다. ("오프라인 교육장"은 원래 교육 관리 페이지에 있던 섹션인데,
  // 페이지 맨 아래로 옮겼다.)
  const showFacility = !hiddenKeys.has("training-facility");
  const labelFacility = labels.get("training-facility") ?? "오프라인 교육장";

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      <section id="admin-section-culture" className="mt-14 scroll-mt-24 space-y-6">
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
              <p className="mt-3 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
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

      {showFacility && (
        <section id="admin-section-training-facility" className="mt-16 scroll-mt-24">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{labelFacility}</h3>
          {settings.training_facility_description && (
            <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
              {settings.training_facility_description}
            </p>
          )}
          <div className="mt-5">
            <ProgramPhotoSlider photos={settings.training_facility_photos} />
          </div>
          {settings.training_facility_highlights.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-y-6 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white p-6 sm:grid-cols-4 sm:gap-y-0 sm:divide-y-0 sm:divide-x dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900">
              {settings.training_facility_highlights.map((h) => (
                <div key={h.id} className="px-4 pt-5 first:pt-0 first:pl-0 last:pr-0 sm:pt-0">
                  <p className="font-bold text-neutral-900 dark:text-white">{h.title}</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {h.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
