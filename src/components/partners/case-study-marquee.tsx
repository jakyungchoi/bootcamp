// 협업 사례 로고를 옆으로 끊김 없이 계속 흐르는 띠(마퀴) 형태로 보여준다.
// 카드 하나씩 넘겨보던 예전 방식과 달리 제목/설명 텍스트 없이 로고만 보여주고,
// 어떤 기업인지는 로고에 마우스를 올리면 말풍선(브라우저 기본 title 툴팁)으로 확인할 수 있다.
// 애니메이션은 CSS만으로 동작해서 별도의 클라이언트 스크립트가 필요 없다 (globals.css의
// .marquee-track 참고).

import { Building2 } from "lucide-react";
import type { CompanyCaseStudy } from "@/lib/types";

export function CaseStudyMarquee({ cases }: { cases: CompanyCaseStudy[] }) {
  if (cases.length === 0) return null;

  // 등록된 기업 수가 너무 적으면(1~2개) 한 바퀴가 짧아서 부자연스러우니, 화면을 채울 만큼
  // 미리 여러 번 반복해둔다. 이 반복된 목록을 "한 묶음"으로 보고, 아래에서 그 묶음을 통째로
  // 한 번 더 이어붙여 정확히 절반만큼 이동시키는 방식으로 끊김 없이 순환시킨다.
  const unit = cases.length < 6 ? Array.from({ length: 6 }, () => cases).flat() : cases;
  const items = [...unit, ...unit];
  const durationSeconds = Math.max(unit.length * 2.5, 18);

  return (
    <div className="overflow-hidden">
      <div
        className="marquee-track flex w-max items-center gap-4"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {items.map((c, idx) => (
          <div
            key={`${c.id}-${idx}`}
            title={c.company_name}
            className="flex h-16 w-40 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- 다양한 비율의 업로드 로고 이미지를 그대로 보여준다.
              <img
                src={c.image_url}
                alt={c.company_name}
                className="max-h-10 max-w-full object-contain"
              />
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                <Building2 size={15} className="shrink-0 text-neutral-300" />
                {c.company_name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
