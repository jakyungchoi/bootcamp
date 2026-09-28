// "전체 교육 과정" 개요 — is_main으로 표시한 과정(보통 부트캠프) 하나만 위쪽에 크게 강조해서
// 보여주고, 나머지 과정(예: AX 챔피언, AX 해커톤, 커리어 교육)은 그 아래 작은 카드로 나란히
// 보여준다. detailAnchor로 넘긴 위치로 스크롤하는 링크를 강조 카드에 달아서, "이 과정을
// 기준으로 아래 상세 내용이 이어진다"는 것을 알려준다.

import { ArrowDown } from "lucide-react";
import type { EducationProgram } from "@/lib/types";

export function ProgramOverview({
  programs,
  detailAnchor,
}: {
  programs: EducationProgram[];
  detailAnchor: string;
}) {
  const main = programs.find((p) => p.is_main);
  const subs = programs.filter((p) => !p.is_main);

  return (
    <div className="mt-4 grid gap-3.5">
      {main && (
        <div className="rounded-[20px] border-[1.5px] border-brand bg-white p-7 shadow-sm dark:bg-neutral-900">
          <span className="inline-flex w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand dark:bg-brand/20">
            {main.duration_label}
          </span>
          <h3 className="mt-3 text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {main.title}
          </h3>
          <p className="mt-2.5 max-w-xl whitespace-pre-line text-[14.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {main.description}
          </p>
          <a
            href={detailAnchor}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:opacity-80"
          >
            아래에서 자세히 보기
            <ArrowDown size={14} />
          </a>
        </div>
      )}

      {subs.length > 0 && (
        <div className="grid gap-3.5 sm:grid-cols-3">
          {subs.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <span className="w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand dark:bg-brand/20">
                {p.duration_label}
              </span>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">{p.title}</h4>
              <p className="text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
