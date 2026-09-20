import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, ImagePlaceholder } from "@/components/ui/card";
import { Icon } from "@/components/icon-map";
import { getCompanyCaseStudies, getCompanyFlowSteps, getCompanyParticipationTypes } from "@/lib/data";

export const metadata: Metadata = {
  title: "참여 기업 연계 | 원티드랩 부트캠프 교육사업",
};

export default async function PartnersPage() {
  const [types, steps, cases] = await Promise.all([
    getCompanyParticipationTypes(),
    getCompanyFlowSteps(),
    getCompanyCaseStudies(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="How we connect to industry"
        title="참여 기업 연계"
        description="기업이 단순히 교육을 후원하는 것이 아니라, 교육 과정에 직접 참여할 수 있다는 점을 보여줍니다."
      />

      {/* 8-1 기업 참여 방식 */}
      <section className="mt-14">
        <h3 className="text-sm font-semibold text-neutral-400">01. 기업 참여 방식</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {types.map((type) => (
            <Card key={type.id}>
              <Icon name={type.icon} className="h-6 w-6 text-brand" />
              <p className="mt-3 font-bold text-neutral-900 dark:text-white">{type.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {type.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 8-2 가능한 협업 활동 */}
      <section className="mt-16">
        <h3 className="text-sm font-semibold text-neutral-400">02. 이런 협업이 가능해요</h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          기업과 함께 진행할 수 있는 활동입니다.
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

      {/* 8-3 협업 사례 */}
      <section className="mt-16">
        <h3 className="text-sm font-semibold text-neutral-400">03. 협업 사례</h3>
        {cases.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              아직 공개된 협업 사례가 없습니다.
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <Card key={c.id}>
                <ImagePlaceholder />
                <p className="mt-3 text-xs font-semibold text-brand">{c.company_name}</p>
                <p className="mt-1 font-bold text-neutral-900 dark:text-white">{c.title}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{c.description}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
