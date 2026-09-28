import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { CaseStudyMarquee } from "@/components/partners/case-study-marquee";
import { ApplicationCta } from "@/components/partners/application-cta";
import { CustomSectionBlock } from "@/components/ui/custom-section-block";
import { isPartnersFormConfigured } from "@/lib/partners-submission";
import { BUILTIN_MENU } from "@/lib/admin-menu";
import {
  getAdminMenuLabels,
  getAdminMenuOrder,
  getCompanyCaseStudies,
  getCompanyFlowSteps,
  getCompanyParticipationTypes,
  getCustomSectionsForPage,
  getHiddenAdminKeys,
  getPageHeader,
  getSiteSettings,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "참여 기업 연계 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

// 이 페이지에 들어가는 3개 섹션의 키. 관리자 대시보드 메뉴 목록(admin-menu.ts)의 키와 같아서,
// 대시보드에서 위/아래 화살표로 바꾼 순서를 그대로 이 페이지의 섹션 순서에도 반영할 수 있다.
type SectionKey = "case-studies" | "company-flow" | "participation-types";

export default async function PartnersPage() {
  const [types, steps, cases, header, settings, hiddenKeys, labels, menuOrder, customSections] = await Promise.all([
    getCompanyParticipationTypes(),
    getCompanyFlowSteps(),
    getCompanyCaseStudies(),
    getPageHeader("partners"),
    getSiteSettings(),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
    getAdminMenuOrder(),
    getCustomSectionsForPage("partners"),
  ]);

  // 관리자 대시보드에서 위/아래 화살표로 바꾼 순서가 있으면 그 값을, 없으면 admin-menu.ts에 정해진
  // 기본 순서를 그대로 쓴다.
  const orderFor = (key: SectionKey) => menuOrder.get(key) ?? BUILTIN_MENU.find((b) => b.key === key)?.order ?? 0;

  // 관리자 대시보드에서 이름을 바꾼 메뉴는 공개 화면의 섹션 제목도 그 이름을 따라간다.
  const labelCaseStudies = labels.get("case-studies") ?? "협업 사례";
  const labelCompanyFlow = labels.get("company-flow") ?? "이런 협업이 가능해요";
  const labelParticipationTypes = labels.get("participation-types") ?? "기업 참여 방식";

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감춘다.
  const showCaseStudies = !hiddenKeys.has("case-studies");
  const showCompanyFlow = !hiddenKeys.has("company-flow");
  const showParticipationTypes = !hiddenKeys.has("participation-types");

  // 구글 시트 연동(앱스 스크립트 웹 앱 주소 환경 변수)이 서버에 설정되어 있어야만 "참여 신청하기" 버튼을 보여준다.
  const sheetsConfigured = isPartnersFormConfigured();

  const sectionRenderers: Record<SectionKey, (num: number, isFirst: boolean) => ReactNode> = {
    "case-studies": (num, isFirst) => (
      <section id="admin-section-case-studies" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCaseStudies}
        </h3>
        <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
          {settings.case_studies_description}
        </p>
        {cases.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">아직 공개된 협업 사례가 없습니다.</p>
          </Card>
        ) : (
          <div className="mt-4">
            <CaseStudyMarquee cases={cases} />
          </div>
        )}
      </section>
    ),
    "company-flow": (num, isFirst) => (
      <section id="admin-section-company-flow" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCompanyFlow}
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
    ),
    "participation-types": (num, isFirst) => (
      <section id="admin-section-participation-types" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {String(num).padStart(2, "0")}. {labelParticipationTypes}
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
    ),
  };

  const sectionShow: Record<SectionKey, boolean> = {
    "case-studies": showCaseStudies,
    "company-flow": showCompanyFlow,
    "participation-types": showParticipationTypes,
  };

  const visibleKeys = (Object.keys(sectionShow) as SectionKey[])
    .filter((key) => sectionShow[key])
    .sort((a, b) => orderFor(a) - orderFor(b));

  // 고정 섹션과, 관리자가 "새 섹션 추가"로 이 페이지에 끼워 넣은 커스텀 섹션을 순서(order) 기준
  // 하나로 합쳐서 그린다. 커스텀 섹션은 2000번대 순서를 쓰므로(admin-menu.ts 참고), 대시보드에서
  // 위/아래 화살표로 옮긴 위치가 여기서도 그대로 반영된다.
  const entries: { order: number; render: (num: number, isFirst: boolean) => ReactNode }[] = [
    ...visibleKeys.map((key) => ({ order: orderFor(key), render: sectionRenderers[key] })),
    ...customSections.map((section, i) => ({
      order: 2000 + i,
      render: (num: number, isFirst: boolean) => (
        <CustomSectionBlock key={section.id} section={section} num={num} isFirst={isFirst} />
      ),
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {entries.map((entry, idx) => (
        <div key={idx}>{entry.render(idx + 1, idx === 0)}</div>
      ))}
    </div>
  );
}
