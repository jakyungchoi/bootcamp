import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { CaseStudyMarquee } from "@/components/partners/case-study-marquee";
import { ApplicationCta } from "@/components/partners/application-cta";
import { isPartnersFormConfigured } from "@/lib/partners-submission";
import {
  getAdminMenuLabels,
  getCompanyCaseStudies,
  getCompanyFlowSteps,
  getCompanyParticipationTypes,
  getHiddenAdminKeys,
  getPageHeader,
  getSiteSettings,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "참여 기업 연계 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

// 화면에 실제로 보이는 섹션에만 번호를 매긴다 (관리자 대시보드에서 숨긴 섹션은 번호도 건너뛴다).
function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function PartnersPage() {
  const [types, steps, cases, header, settings, hiddenKeys, labels] = await Promise.all([
    getCompanyParticipationTypes(),
    getCompanyFlowSteps(),
    getCompanyCaseStudies(),
    getPageHeader("partners"),
    getSiteSettings(),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
  ]);

  // 관리자 대시보드에서 이름을 바꾼 메뉴는 공개 화면의 섹션 제목도 그 이름을 따라간다.
  const labelCaseStudies = labels.get("case-studies") ?? "협업 사례";
  const labelCompanyFlow = labels.get("company-flow") ?? "이런 협업이 가능해요";
  const labelParticipationTypes = labels.get("participation-types") ?? "기업 참여 방식";

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감추고,
  // 남은 섹션의 번호를 앞에서부터 다시 매긴다.
  const showCaseStudies = !hiddenKeys.has("case-studies");
  const showCompanyFlow = !hiddenKeys.has("company-flow");
  const showParticipationTypes = !hiddenKeys.has("participation-types");

  // 구글 시트 연동(앱스 스크립트 웹 앱 주소 환경 변수)이 서버에 설정되어 있어야만 "참여 신청하기" 버튼을 보여준다.
  const sheetsConfigured = isPartnersFormConfigured();

  let sectionNumber = 0;
  const numCaseStudies = showCaseStudies ? ++sectionNumber : 0;
  const numCompanyFlow = showCompanyFlow ? ++sectionNumber : 0;
  const numParticipationTypes = showParticipationTypes ? ++sectionNumber : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {/* 8-1 협업 사례 (슬라이드) */}
      {showCaseStudies && (
        <section id="admin-section-case-studies" className="mt-14 scroll-mt-24">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {pad(numCaseStudies)}. {labelCaseStudies}
          </h3>
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.case_studies_description}
          </p>
          {cases.length === 0 ? (
            <Card className="mt-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                아직 공개된 협업 사례가 없습니다.
              </p>
            </Card>
          ) : (
            <div className="mt-4">
              <CaseStudyMarquee cases={cases} />
            </div>
          )}
        </section>
      )}

      {/* 8-2 가능한 협업 활동 */}
      {showCompanyFlow && (
        <section id="admin-section-company-flow" className="mt-16 scroll-mt-24">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {pad(numCompanyFlow)}. {labelCompanyFlow}
          </h3>
          <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
            {settings.company_flow_description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <CheckCircle2 size={16} className="shrink-0 text-brand" />
                {step.title}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8-3 기업 참여 방식 */}
      {showParticipationTypes && (
        <section id="admin-section-participation-types" className="mt-16 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {pad(numParticipationTypes)}. {labelParticipationTypes}
              </h3>
              <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
                {settings.participation_types_description}
              </p>
            </div>
            {sheetsConfigured && (
              <ApplicationCta
                participationOptions={types.map((type) => type.title)}
                meetingOptions={settings.partners_meeting_options}
                privacyNotice={settings.partners_privacy_notice}
                submitNotice={settings.partners_submit_notice}
                requiredFields={settings.partners_required_fields}
                fieldLabels={settings.partners_field_labels}
                fieldVisibility={settings.partners_field_visibility}
                customFields={settings.partners_custom_fields}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
