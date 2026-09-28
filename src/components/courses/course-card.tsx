"use client";

// 과정 카드. 프로젝트 상세(course.projects)가 하나라도 있으면 클릭 시 좌우로 넘겨보는
// 팝업(CarouselModal)이 뜬다. 등록된 프로젝트 상세가 없으면 예전처럼 클릭되지 않는 카드로 보여준다.
// 카드가 속한 교육 영역(category)의 세부 토픽은 카드 하단에 작은 태그로 보여준다 — 카테고리
// 이름 자체는 이 카드 위에 한 번만 나오는 그룹 제목(courses/page.tsx)에서 보여주므로 카드마다
// 중복해서 표시하지 않는다.

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ui/card";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { Course, CourseCategory } from "@/lib/types";

export function CourseCard({ course, category }: { course: Course; category?: CourseCategory }) {
  const [open, setOpen] = useState(false);
  const hasProjects = course.projects.length > 0;
  const topics = category?.topics ?? [];

  return (
    <>
      <div
        role={hasProjects ? "button" : undefined}
        tabIndex={hasProjects ? 0 : undefined}
        onClick={hasProjects ? () => setOpen(true) : undefined}
        onKeyDown={
          hasProjects
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(true);
              }
            : undefined
        }
        className={`flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow dark:border-white/10 dark:bg-neutral-900 ${
          hasProjects ? "cursor-pointer hover:shadow-md" : ""
        }`}
      >
        <ImagePlaceholder aspectClassName="aspect-[21/9]" />
        <h4 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">{course.title}</h4>
        <p className="text-sm font-medium text-neutral-400">{course.subtitle}</p>
        <p className="mt-2 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
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
        {topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-black/5 pt-3 dark:border-white/10">
            {topics.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand dark:bg-brand/20"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {hasProjects && (
          <p
            className={`text-xs font-semibold text-brand ${
              topics.length > 0 ? "mt-2" : "mt-4 border-t border-black/5 pt-3 dark:border-white/10"
            }`}
          >
            클릭해서 프로젝트 자세히 보기
          </p>
        )}
      </div>

      {open && hasProjects && (
        <CarouselModal
          title={course.title}
          items={course.projects.map((p) => ({
            image_url: p.image_url,
            title: p.title,
            description: p.description,
          }))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
