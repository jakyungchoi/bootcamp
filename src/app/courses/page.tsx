import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { FlowSteps } from "@/components/ui/flow-steps";
import { Card, ImagePlaceholder } from "@/components/ui/card";
import { getCourseCategories, getCourses, getCurriculumFlowSteps } from "@/lib/data";

export const metadata: Metadata = {
  title: "운영 교육 과정 | 원티드랩 부트캠프 교육사업",
};

export default async function CoursesPage() {
  const [categories, courses, flowSteps] = await Promise.all([
    getCourseCategories(),
    getCourses(),
    getCurriculumFlowSteps(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="What we teach"
        title="운영 교육 과정"
        description="원티드랩이 어떤 교육을 제공할 수 있는지 교육 영역과 교육 방식을 통해 보여줍니다."
      />

      {/* 5-1 교육 영역 */}
      <section className="mt-14">
        <h3 className="text-sm font-semibold text-neutral-400">01. 교육 영역</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <p className="text-base font-bold text-neutral-900 dark:text-white">{category.name}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                {category.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brand" />
                    {topic}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* 5-2 커리큘럼 구성 */}
      <section className="mt-16">
        <h3 className="text-sm font-semibold text-neutral-400">02. 커리큘럼 구성</h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          교육의 전체 흐름을 단계별로 보여줍니다.
        </p>
        <div className="mt-5">
          <FlowSteps steps={flowSteps.map((s) => s.title)} />
        </div>
      </section>

      {/* 5-3 대표 교육 과정 */}
      <section className="mt-16">
        <h3 className="text-sm font-semibold text-neutral-400">03. 대표 교육 과정</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const category = categories.find((c) => c.id === course.category_id);
            return (
              <Card key={course.id} className="flex flex-col">
                <ImagePlaceholder />
                {category && (
                  <span className="mt-4 inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
                    {category.name}
                  </span>
                )}
                <h4 className="mt-3 text-lg font-bold text-neutral-900 dark:text-white">
                  {course.title}
                </h4>
                <p className="text-sm font-medium text-neutral-400">{course.subtitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {course.description}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                  {course.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-black/5 pt-3 text-xs text-neutral-400 dark:border-white/10">
                  프로젝트 · {course.project}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
