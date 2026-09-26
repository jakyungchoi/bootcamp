import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon-map";
import { MonthsTimeline } from "@/components/education/months-timeline";
import { ProgramPhotoSlider } from "@/components/culture/program-photo-slider";
import { BUILTIN_MENU } from "@/lib/admin-menu";
import {
  getAdminMenuLabels,
  getAdminMenuOrder,
  getCollaborationTools,
  getHiddenAdminKeys,
  getLearnerManagementItems,
  getManagementHighlights,
  getManagementMetrics,
  getManagementMonths,
  getPageHeader,
  getQualityManagementItems,
  getSiteSettings,
  getSupportPlanTracks,
} from "@/lib/data";

// 화면에 실제로 보이는 섹션에만 번호를 매긴다 (관리자 대시보드에서 숨긴 섹션은 번호도 건너뛴다).
function pad(n: number) {
  return String(n).padStart(2, "0");
}

// 이 페이지에 들어가는 6개 섹션의 키. 관리자 대시보드 메뉴 목록(admin-menu.ts)의 키와 같아서,
// 대시보드에서 위/아래 화살표로 바꾼 순서를 그대로 이 페이지의 섹션 순서에도 반영할 수 있다.
type SectionKey =
  | "management-metrics"
  | "training-facility"
  | "learner-management"
  | "support-plans"
  | "management-months"
  | "quality-management";

export const metadata: Metadata = {
  title: "교육 관리 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

export default async function EducationManagementPage() {
  const [
    learnerManagementItems,
    supportPlanTracks,
    qualityManagementItems,
    collaborationTools,
    header,
    metrics,
    highlights,
    months,
    settings,
    hiddenKeys,
    labels,
    menuOrder,
  ] = await Promise.all([
    getLearnerManagementItems(),
    getSupportPlanTracks(),
    getQualityManagementItems(),
    getCollaborationTools(),
    getPageHeader("education-management"),
    getManagementMetrics(),
    getManagementHighlights(),
    getManagementMonths(),
    getSiteSettings(),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
    getAdminMenuOrder(),
  ]);
  // 관리자 대시보드에서 위/아래 화살표로 바꾼 순서가 있으면 그 값을, 없으면 admin-menu.ts에 정해진
  // 기본 순서를 그대로 쓴다. 이 페이지의 6개 섹션 순서를 여기서 계산한 값에 맞춰 다시 정렬한다.
  const orderFor = (key: SectionKey) => menuOrder.get(key) ?? BUILTIN_MENU.find((b) => b.key === key)?.order ?? 0;
  // "구분"은 관리자 페이지에서 자유롭게 입력하는 값이라, 실제로 등록된 값만 나온 순서대로 카드를 만든다.
  const qualityGroups = Array.from(new Set(qualityManagementItems.map((q) => q.group)));

  // 관리자 대시보드에서 이름을 바꾼 메뉴는 공개 화면의 섹션 제목도 그 이름을 따라간다.
  const labelMetrics = labels.get("management-metrics") ?? "교육 성과 지표";
  const labelFacility = labels.get("training-facility") ?? "오프라인 교육장";
  const labelLearnerManagement = labels.get("learner-management") ?? "학습자 관리";
  const labelSupportPlans = labels.get("support-plans") ?? "학습부진자 지도 계획";
  const labelMonths = labels.get("management-months") ?? "개월차별 관리";
  const labelQuality = labels.get("quality-management") ?? "교육 품질 관리";

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감추고,
  // 남은 섹션의 번호를 앞에서부터 다시 매긴다.
  const showMetrics = !hiddenKeys.has("management-metrics") && (metrics.length > 0 || highlights.length > 0);
  const showFacility = !hiddenKeys.has("training-facility");
  const showLearnerManagement = !hiddenKeys.has("learner-management");
  const showSupportPlans = !hiddenKeys.has("support-plans");
  const showMonths = !hiddenKeys.has("management-months");
  const showQualityGroups = !hiddenKeys.has("quality-management");
  const showCollaborationTools = !hiddenKeys.has("collaboration-tools");
  const showQualitySection = showQualityGroups || showCollaborationTools;

  // 섹션마다 "보일지 여부"와 "그릴 내용"을 미리 함수로 묶어두고, 아래에서 관리자 대시보드
  // 순서대로 정렬한 뒤 실제로 보이는 것만 앞에서부터 번호를 다시 매겨 그린다.
  const sectionRenderers: Record<SectionKey, (num: number, isFirst: boolean) => ReactNode> = {
    "management-metrics": (num, isFirst) => (
      <section
        id="admin-section-management-metrics"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelMetrics}
        </h3>
        {settings.management_metrics_description && (
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.management_metrics_description}
          </p>
        )}
        {metrics.length > 0 && (
          <div className="mt-5 grid grid-cols-2 divide-x divide-brand/15 rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.06] via-white to-white p-6 shadow-sm sm:grid-cols-4 dark:divide-brand/20 dark:border-brand/20 dark:from-brand/10 dark:via-neutral-900 dark:to-neutral-900">
            {metrics.map((m) => (
              <div key={m.id} className="px-3 text-center first:pl-0 last:pr-0">
                <p className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                  {m.value}
                </p>
                <p className="mt-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">{m.label}</p>
              </div>
            ))}
          </div>
        )}
        {highlights.length > 0 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h, i) =>
              h.type === "list" ? (
                <div key={h.id} className="rounded-2xl bg-neutral-950 p-6 text-white shadow-md">
                  <p className="text-lg font-bold">{h.title}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-neutral-300">
                    {h.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  key={h.id}
                  className={`rounded-2xl p-6 text-white shadow-md ${
                    i % 2 === 0
                      ? "bg-gradient-to-br from-brand to-neutral-900"
                      : "bg-gradient-to-br from-neutral-800 to-neutral-950"
                  }`}
                >
                  <p className="text-4xl font-bold">{h.value}</p>
                  <p className="mt-2 whitespace-pre-line text-justify text-sm leading-relaxed text-white/80">{h.description}</p>
                </div>
              )
            )}
          </div>
        )}
      </section>
    ),
    "training-facility": (num, isFirst) => (
      <section
        id="admin-section-training-facility"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelFacility}
        </h3>
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
    "learner-management": (num, isFirst) => (
      <section
        id="admin-section-learner-management"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelLearnerManagement}
        </h3>
        {settings.learner_management_description && (
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.learner_management_description}
          </p>
        )}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {learnerManagementItems.map((item) => (
            <Card key={item.id}>
              <Icon name={item.icon} className="h-6 w-6 text-brand" />
              <p className="mt-3 font-bold text-neutral-900 dark:text-white">{item.title}</p>
              <p className="mt-1.5 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    ),
    "support-plans": (num, isFirst) => (
      <section
        id="admin-section-support-plans"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelSupportPlans}
        </h3>
        {settings.support_plans_description && (
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.support_plans_description}
          </p>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {supportPlanTracks.map((track) => (
            <Card key={track.id}>
              <p className="font-bold text-neutral-900 dark:text-white">{track.track_name}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                {track.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    ),
    "management-months": (num, isFirst) => (
      <section
        id="admin-section-management-months"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelMonths}
        </h3>
        {settings.management_months_description && (
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.management_months_description}
          </p>
        )}
        {months.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              아직 등록된 개월차별 관리 구간이 없습니다.
            </p>
          </Card>
        ) : (
          <div className="mt-5">
            <MonthsTimeline months={months} totalMonths={settings.management_months_total_months} />
          </div>
        )}
      </section>
    ),
    "quality-management": (num, isFirst) => (
      <section
        id="admin-section-quality-management"
        className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}
      >
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {pad(num)}. {labelQuality}
        </h3>
        {settings.quality_management_description && (
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.quality_management_description}
          </p>
        )}
        {showQualityGroups && (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {qualityGroups.map((group) => (
              <Card key={group}>
                <p className="font-bold text-neutral-900 dark:text-white">{group}</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {qualityManagementItems
                    .filter((q) => q.group === group)
                    .map((q) => (
                      <li key={q.id}>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">{q.title}</span>
                        <span className="whitespace-pre-line text-neutral-400"> — {q.description}</span>
                      </li>
                    ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {showCollaborationTools && (
          <Card className="mt-5">
            <p className="font-bold text-neutral-900 dark:text-white">협업 환경</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              현재 사용 중인 협업 도구입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {collaborationTools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-neutral-700 dark:border-white/15 dark:text-neutral-200"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </Card>
        )}
      </section>
    ),
  };

  const sectionShow: Record<SectionKey, boolean> = {
    "management-metrics": showMetrics,
    "training-facility": showFacility,
    "learner-management": showLearnerManagement,
    "support-plans": showSupportPlans,
    "management-months": showMonths,
    "quality-management": showQualitySection,
  };

  const visibleKeys = (Object.keys(sectionShow) as SectionKey[])
    .filter((key) => sectionShow[key])
    .sort((a, b) => orderFor(a) - orderFor(b));

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {visibleKeys.map((key, idx) => (
        <div key={key}>{sectionRenderers[key](idx + 1, idx === 0)}</div>
      ))}
    </div>
  );
}
