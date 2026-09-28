import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FlowSteps } from "@/components/ui/flow-steps";
import { CourseCard } from "@/components/courses/course-card";
import { ProgramOverview } from "@/components/courses/program-overview";
import { CustomSectionBlock } from "@/components/ui/custom-section-block";
import { BUILTIN_MENU } from "@/lib/admin-menu";
import {
  getAdminMenuLabels,
  getAdminMenuOrder,
  getCourseCategories,
  getCourses,
  getCurriculumFlowSteps,
  getCustomSectionsForPage,
  getEducationPrograms,
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
// ("courses"는 더 이상 별도 섹션이 아니라 "categories" 섹션 안에서 그룹별로 함께 그려지므로
// 여기 목록에는 없다 — 대신 "categories" 섹션이 교육 영역별로 과정 카드를 묶어서 보여준다.)
type SectionKey = "programs" | "categories" | "curriculum";

export default async function CoursesPage() {
  const [
    programs,
    categories,
    courses,
    flowSteps,
    header,
    hiddenKeys,
    labels,
    menuOrder,
    customSections,
  ] = await Promise.all([
    getEducationPrograms(),
    getCourseCategories(),
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
  const labelPrograms = labels.get("programs") ?? "전체 교육 과정";
  const labelCategories = labels.get("categories") ?? "부트캠프 교육 영역";
  const labelCurriculum = labels.get("curriculum") ?? "커리큘럼 구성";

  // 관리자 대시보드에서 "숨기기" 한 메뉴에 해당하는 섹션은 공개 화면에서도 통째로 감춘다.
  const showPrograms = !hiddenKeys.has("programs");
  const showCategories = !hiddenKeys.has("categories");
  const showCurriculum = !hiddenKeys.has("curriculum");

  const sectionRenderers: Record<SectionKey, (num: number, isFirst: boolean) => ReactNode> = {
    programs: (num, isFirst) => (
      <section id="admin-section-programs" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelPrograms}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          원티드랩이 운영하는 교육 과정입니다. 가장 비중 있게 소개하는 과정은 아래에서 이어서 자세히 다룹니다.
        </p>
        <ProgramOverview programs={programs} detailAnchor="#admin-section-categories" />
      </section>
    ),
    categories: (num, isFirst) => (
      <section id="admin-section-categories" className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {String(num).padStart(2, "0")}. {labelCategories}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          교육 영역별로 실제 운영 중인 대표 과정을 함께 보여줍니다. 과정을 클릭하면 실제 프로젝트 내용을 좌우로
          넘겨보며 확인할 수 있습니다.
        </p>

        {categories.map((category) => {
          const categoryCourses = courses.filter((c: Course) => c.category_id === category.id);
          if (categoryCourses.length === 0) return null;
          return (
            <div key={category.id} className="mt-7 first:mt-5">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-[3px] rounded-full bg-neutral-900 dark:bg-white" />
                <h4 className="text-[15px] font-bold text-neutral-900 dark:text-white">{category.name}</h4>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-5">
                {categoryCourses.map((course) => (
                  <div key={course.id} className="min-w-[280px] flex-1 basis-[280px]">
                    <CourseCard course={course} category={category} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
  };

  const sectionShow: Record<SectionKey, boolean> = {
    programs: showPrograms,
    categories: showCategories,
    curriculum: showCurriculum,
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
