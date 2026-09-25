import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { FlowSteps } from "@/components/ui/flow-steps";
import { Card } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/course-card";
import {
  getCourseCategories,
  getCourseDurationTypes,
  getCourses,
  getCurriculumFlowSteps,
  getPageHeader,
} from "@/lib/data";
import type { Course } from "@/lib/types";

export const metadata: Metadata = {
  title: "운영 교육 과정 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [categories, durationTypes, courses, flowSteps, header] = await Promise.all([
    getCourseCategories(),
    getCourseDurationTypes(),
    getCourses(),
    getCurriculumFlowSteps(),
    getPageHeader("courses"),
  ]);

  // 과정 기간 분류(단기/중장기 등)로 먼저 묶고, 어떤 분류에도 속하지 않은 과정은 마지막에 따로 모아 보여준다.
  const coursesByDurationType = durationTypes.map((d) => ({
    durationType: d,
    courses: courses.filter((c) => c.duration_type_id === d.id),
  }));
  const uncategorized = courses.filter(
    (c) => !c.duration_type_id || !durationTypes.some((d) => d.id === c.duration_type_id)
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

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

      {/* 5-3 대표 교육 과정 — 과정 기간 분류(단기/중장기 등)로 묶어서 보여준다 */}
      <section className="mt-16">
        <h3 className="text-sm font-semibold text-neutral-400">03. 대표 교육 과정</h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          과정을 클릭하면 실제 프로젝트 내용을 좌우로 넘겨보며 확인할 수 있습니다.
        </p>

        {[...coursesByDurationType, { durationType: null, courses: uncategorized }]
          .filter((group) => group.courses.length > 0)
          .map((group) => (
            <div key={group.durationType?.id ?? "uncategorized"} className="mt-8 first:mt-4">
              <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                {group.durationType?.name ?? "기타 과정"}
              </h4>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.courses.map((course: Course) => {
                  const category = categories.find((c) => c.id === course.category_id);
                  return <CourseCard key={course.id} course={course} categoryName={category?.name} />;
                })}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
