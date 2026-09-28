import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ProgramPhotoSlider } from "@/components/culture/program-photo-slider";
import { BUILTIN_MENU } from "@/lib/admin-menu";
import {
  getAdminMenuLabels,
  getAdminMenuOrder,
  getCulturePrograms,
  getHiddenAdminKeys,
  getPageHeader,
  getSiteSettings,
} from "@/lib/data";

// 이 페이지에 들어가는 2개 섹션의 키. 관리자 대시보드 메뉴 목록(admin-menu.ts)의 키와 같아서,
// 대시보드에서 위/아래 화살표로 바꾼 순서를 그대로 이 페이지의 섹션 순서에도 반영할 수 있다.
// (education-management 페이지와 똑같은 방식 — "오프라인 교육장"을 관리자가 직접 위/아래로
// 옮길 수 있게 해달라는 요청으로 추가했다.)
type SectionKey = "culture" | "training-facility";

export const metadata: Metadata = {
  title: "교육 문화 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

export default async function CulturePage() {
  const [programs, header, settings, hiddenKeys, labels, menuOrder] = await Promise.all([
    getCulturePrograms(),
    getPageHeader("culture"),
    getSiteSettings(),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
    getAdminMenuOrder(),
  ]);

  // 관리자 대시보드에서 위/아래 화살표로 바꾼 순서가 있으면 그 값을, 없으면 admin-menu.ts에 정해진
  // 기본 순서를 그대로 쓴다. (기본값: "오프라인 교육장"이 "교육 문화 프로그램"보다 위에 오도록
  // admin-menu.ts에서 순서를 정해뒀다.)
  const orderFor = (key: SectionKey) => menuOrder.get(key) ?? BUILTIN_MENU.find((b) => b.key === key)?.order ?? 0;

  // 관리자 대시보드에서 이름을 바꾼 메뉴는 공개 화면의 섹션 제목도 그 이름을 따라간다.
  const labelFacility = labels.get("training-facility") ?? "오프라인 교육장";

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감춘다.
  const showCulture = !hiddenKeys.has("culture");
  const showFacility = !hiddenKeys.has("training-facility");

  const sectionRenderers: Record<SectionKey, (isFirst: boolean) => ReactNode> = {
    culture: (isFirst) => (
      <section
        id="admin-section-culture"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24 space-y-6`}
      >
        {programs.map((program, i) => (
          <Card key={program.id} className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">0{i + 1}</p>
              <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">{program.title}</h3>
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
    ),
    "training-facility": (isFirst) => (
      <section
        id="admin-section-training-facility"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
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
    ),
  };

  const sectionShow: Record<SectionKey, boolean> = {
    culture: showCulture,
    "training-facility": showFacility,
  };

  const visibleKeys = (Object.keys(sectionShow) as SectionKey[])
    .filter((key) => sectionShow[key])
    .sort((a, b) => orderFor(a) - orderFor(b));

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {visibleKeys.map((key, idx) => (
        <div key={key}>{sectionRenderers[key](idx === 0)}</div>
      ))}
    </div>
  );
}
