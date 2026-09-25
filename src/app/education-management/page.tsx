import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon-map";
import { MonthCard } from "@/components/education/month-card";
import {
  getCollaborationTools,
  getHiddenAdminKeys,
  getLearnerManagementItems,
  getManagementHighlights,
  getManagementMetrics,
  getManagementMonths,
  getPageHeader,
  getQualityManagementItems,
  getSupportPlanTracks,
} from "@/lib/data";

// 화면에 실제로 보이는 섹션에만 번호를 매긴다 (관리자 대시보드에서 숨긴 섹션은 번호도 건너뛴다).
function pad(n: number) {
  return String(n).padStart(2, "0");
}

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
    hiddenKeys,
  ] = await Promise.all([
    getLearnerManagementItems(),
    getSupportPlanTracks(),
    getQualityManagementItems(),
    getCollaborationTools(),
    getPageHeader("education-management"),
    getManagementMetrics(),
    getManagementHighlights(),
    getManagementMonths(),
    getHiddenAdminKeys(),
  ]);
  // "구분"은 관리자 페이지에서 자유롭게 입력하는 값이라, 실제로 등록된 값만 나온 순서대로 카드를 만든다.
  const qualityGroups = Array.from(new Set(qualityManagementItems.map((q) => q.group)));

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감추고,
  // 남은 섹션의 번호를 앞에서부터 다시 매긴다.
  const showMetrics = !hiddenKeys.has("management-metrics");
  const showLearnerManagement = !hiddenKeys.has("learner-management");
  const showSupportPlans = !hiddenKeys.has("support-plans");
  const showMonths = !hiddenKeys.has("management-months");
  const showQualityGroups = !hiddenKeys.has("quality-management");
  const showCollaborationTools = !hiddenKeys.has("collaboration-tools");
  const showQualitySection = showQualityGroups || showCollaborationTools;

  let sectionNumber = 0;
  const numLearnerManagement = showLearnerManagement ? ++sectionNumber : 0;
  const numSupportPlans = showSupportPlans ? ++sectionNumber : 0;
  const numMonths = showMonths ? ++sectionNumber : 0;
  const numQuality = showQualitySection ? ++sectionNumber : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {/* 숫자로 검증된 실제 결과 (관리자 페이지 "교육 성과 지표"에서 등록) */}
      {showMetrics && (metrics.length > 0 || highlights.length > 0) && (
        <section className="mt-14">
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 divide-x divide-black/5 rounded-2xl border border-black/5 bg-white p-6 sm:grid-cols-4 dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900">
              {metrics.map((m) => (
                <div key={m.id} className="px-3 text-center first:pl-0 last:pr-0">
                  <p className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white">{m.value}</p>
                  <p className="mt-1.5 text-xs text-neutral-400">{m.label}</p>
                </div>
              ))}
            </div>
          )}
          {highlights.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((h, i) =>
                h.type === "list" ? (
                  <div key={h.id} className="rounded-2xl bg-neutral-950 p-6 text-white">
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
                    className={`rounded-2xl p-6 text-white ${
                      i % 2 === 0
                        ? "bg-gradient-to-br from-brand to-neutral-900"
                        : "bg-gradient-to-br from-neutral-800 to-neutral-950"
                    }`}
                  >
                    <p className="text-3xl font-bold">{h.value}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{h.description}</p>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      )}

      {/* 6-1 학습자 관리 */}
      {showLearnerManagement && (
        <section className="mt-14">
          <h3 className="text-sm font-semibold text-neutral-400">{pad(numLearnerManagement)}. 학습자 관리</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {learnerManagementItems.map((item) => (
              <Card key={item.id}>
                <Icon name={item.icon} className="h-6 w-6 text-brand" />
                <p className="mt-3 font-bold text-neutral-900 dark:text-white">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6-2 학습부진자 지도 계획 */}
      {showSupportPlans && (
        <section className="mt-16">
          <h3 className="text-sm font-semibold text-neutral-400">{pad(numSupportPlans)}. 학습부진자 지도 계획</h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            학습에 어려움을 겪는 교육생을 위한 지원 방식입니다.
          </p>
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
      )}

      {/* 6-3 개월차별 관리 */}
      {showMonths && (
        <section className="mt-16">
          <h3 className="text-sm font-semibold text-neutral-400">{pad(numMonths)}. 개월차별 관리</h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            개월차별로 어떻게 관리하고 있는지 보여줍니다. 카드를 클릭하면 사진을 좌우로 넘겨볼 수 있습니다.
          </p>
          {months.length === 0 ? (
            <Card className="mt-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                아직 등록된 개월차별 관리 카드가 없습니다.
              </p>
            </Card>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {months.map((month) => (
                <MonthCard key={month.id} month={month} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6-4 교육 품질 관리 */}
      {showQualitySection && (
        <section className="mt-16">
          <h3 className="text-sm font-semibold text-neutral-400">{pad(numQuality)}. 교육 품질 관리</h3>
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
                          <span className="text-neutral-400"> — {q.description}</span>
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
      )}
    </div>
  );
}
