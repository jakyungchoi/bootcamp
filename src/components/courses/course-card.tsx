"use client";

// 과정 카드. 프로젝트 상세(course.projects)가 하나라도 있으면 클릭 시 좌우로 넘겨보는
// 팝업(CarouselModal)이 뜬다. 등록된 프로젝트 상세가 없으면 예전처럼 클릭되지 않는 카드로 보여준다.

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ui/card";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { Course } from "@/lib/types";

export function CourseCard({ course, categoryName }: { course: Course; categoryName?: string }) {
  const [open, setOpen] = useState(false);
  const hasProjects = course.projects.length > 0;

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
        <ImagePlaceholder />
        {categoryName && (
          <span className="mt-4 inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
            {categoryName}
          </span>
        )}
        <h4 className="mt-3 text-lg font-bold text-neutral-900 dark:text-white">{course.title}</h4>
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
        <p className="mt-4 border-t border-black/5 pt-3 text-xs text-neutral-400 dark:border-white/10">
          프로젝트 · {course.project}
          {hasProjects && <span className="ml-1.5 text-brand">（클릭해서 자세히 보기）</span>}
        </p>
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
