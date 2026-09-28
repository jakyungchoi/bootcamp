import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FlowSteps } from "@/components/ui/flow-steps";
import { Card } from "@/components/ui/card";
import { CourseCard } from "@/components/courses/course-card";
import { CustomSectionBlock } from "@/components/ui/custom-section-block";
import { BUILTIN_MENU } from "@/lib/admin-menu";
import {
  getAdminMenuLabels,
  getAdminMenuOrder,
  getCourseCategories,
  getCourseDurationTypes,
  getCourses,
  getCurriculumFlowSteps,
  getCustomSectionsForPage,
  getHiddenAdminKeys,
  getPageHeader,
} from "@/lib/data";
import type { Course } from "@/lib/types";

export const metadata: Metadata = {
  title: "운영 교육 과정 | 원티드랩 부트캠프 교육사업",
};

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

// 이 페이지에 들어가는 3개 섹션의 키. 관리자 대시보드 메뉴 목록(admin-menu.ts)의 키와 같아서,
// 대시보드에서 위/아래 화살표로 바꾼 순서를 그대로 이 페이지의 섹션 순서에도 반영할 수 있다.
type SectionKey = "categories" | "curriculum" | "courses";

export default async function CoursesPage() {
  const [categories, durationTypes, courses, flowSteps, header, hiddenKeys, labels, menuOrder, customSections] =
    await Promise.all([
      getCourseCategories(),
      getCourseDurationTypes(),
      getCourses(),
      getCurriculumFlowSteps(),
      getPageHeader("courses"),
      getHiddenAdminKeys(),
      getAdminMenuLabels(),
      getAdminMenuOrder(),
      getCustomSectionsForPage("courses"),
    ]);

  // 관리자 대시보드에서 위/아래 화살표로 바꾼 순서가 있으면 그 값을, 없으면 admin-menu.ts에 정해진
  // 기본 순서를 그대로 쓴다.
  const orderFor = (key: SectionKey) => menuOrder.get(key) ?? BUILTIN_MENU.find((b) => b.key === key)?.order ?? 0;

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

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감춘다.
  const showCategories = !hiddenKeys.has("categories");
  const showCurriculum = !hiddenKeys.has("curriculum");
  const showCourses = !hiddenKeys.has("courses");

  const sectionRenderers: Record<SectionKey, (num: number, isFirst: boolean) => ReactNode> = {
    categories: (num, isFirst) => (
      <section id="admin-section-categories" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCategories}
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
    ),
    curriculum: (num, isFirst) => (
      <section id="admin-section-curriculum" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCurriculum}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">교육의 전체 흐름을 단계별로 보여줍니다.</p>
        <div className="mt-5">
          <FlowSteps steps={flowSteps.map((s) => s.title)} />
        </div>
      </section>
    ),
    courses: (num, isFirst) => (
      <section id="admin-section-courses" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCourses}
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
    ),
  };

  const sectionShow: Record<SectionKey, boolean> = {
    categories: showCategories,
    curriculum: showCurriculum,
    courses: showCourses,
  };

  const visibleKeys = (Object.keys(sectionShow) as SectionKey[])
    .filter((key) => sectionShow[key])
    .sort((a, b) => orderFor(a) - orderFor(b));

  // 고정 섹션과, 관리자가 "새 섹션 추가"로 이 페이지에 끼워 넣은 커스텀 섹션을 순서(order) 기준
  // 하나로 합쳐서 그린다. 커스텀 섹션의 order도 고정 섹션과 같은 숫자 체계를 쓰므로(admin-menu.ts
  // 참고), 대시보드에서 위/아래 화살표로 옮긴 위치가 고정 섹션들 "사이"에도 그대로 반영된다.
  const entries: { order: number; render: (num: number, isFirst: boolean) => ReactNode }[] = [
    ...visibleKeys.map((key) => ({ order: orderFor(key), render: sectionRenderers[key] })),
    ...customSections.map((section) => ({
      order: section.order,
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
