import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { FlowSteps } from "@/components/ui/flow-steps";
import { Card } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/course-card";
import {
  getAdminMenuLabels,
  getCourseCategories,
  getCourseDurationTypes,
  getCourses,
  getCurriculumFlowSteps,
  getHiddenAdminKeys,
  getPageHeader,
} from "@/lib/data";
import type { Course } from "@/lib/types";

export const metadata: Metadata = {
  title: "운영 교육 과정 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

// 화면에 실제로 보이는 섹션에만 번호를 매긴다 (관리자 대시보드에서 숨긴 섹션은 번호도 건너뛴다).
function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function CoursesPage() {
  const [categories, durationTypes, courses, flowSteps, header, hiddenKeys, labels] = await Promise.all([
    getCourseCategories(),
    getCourseDurationTypes(),
    getCourses(),
    getCurriculumFlowSteps(),
    getPageHeader("courses"),
    getHiddenAdminKeys(),
    getAdminMenuLabels(),
  ]);

  // 관리자 대시보드에서 이름을 바꾼 메뉴는 공개 화면의 섹션 제목도 그 이름을 따라간다.
  const labelCategories = labels.get("categories") ?? "교육 영역";
  const labelCurriculum = labels.get("curriculum") ?? "커리큘럼 구성";
  const labelCourses = labels.get("courses") ?? "대표 교육 과정";

  // 과정 기간 분류(단기/중장기 등)로 먼저 묶고, 어떤 분류에도 속하지 않은 과정은 마지막에 따로 모아 보여준다.
  const coursesByDurationType = durationTypes.map((d) => ({
    durationType: d,
    courses: courses.filter((c) => c.duration_type_id === d.id),
  }));
  const uncategorized = courses.filter(
    (c) => !c.duration_type_id || !durationTypes.some((d) => d.id === c.duration_type_id)
  );

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감추고,
  // 남은 섹션의 번호를 앞에서부터 다시 매긴다.
  const showCategories = !hiddenKeys.has("categories");
  const showCurriculum = !hiddenKeys.has("curriculum");
  const showCourses = !hiddenKeys.has("courses");

  let sectionNumber = 0;
  const numCategories = showCategories ? ++sectionNumber : 0;
  const numCurriculum = showCurriculum ? ++sectionNumber : 0;
  const numCourses = showCourses ? ++sectionNumber : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading eyebrow={header.eyebrow} title={header.title} description={header.description} />

      {/* 5-1 교육 영역 */}
      {showCategories && (
        <section id="admin-section-categories" className="mt-14 scroll-mt-24">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {pad(numCategories)}. {labelCategories}
          </h3>
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
      )}

      {/* 5-2 커리큘럼 구성 */}
      {showCurriculum && (
        <section id="admin-section-curriculum" className="mt-16 scroll-mt-24">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {pad(numCurriculum)}. {labelCurriculum}
          </h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            교육의 전체 흐름을 단계별로 보여줍니다.
          </p>
          <div className="mt-5">
            <FlowSteps steps={flowSteps.map((s) => s.title)} />
          </div>
        </section>
      )}

      {/* 5-3 대표 교육 과정 — 과정 기간 분류(단기/중장기 등)로 묶어서 보여준다 */}
      {showCourses && (
        <section id="admin-section-courses" className="mt-16 scroll-mt-24">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {pad(numCourses)}. {labelCourses}
          </h3>
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
      )}
    </div>
  );
}
