// 관리자가 "새 섹션 추가"로 만든 커스텀 섹션을 공개 화면에 그려주는 공용 컴포넌트.
// 운영 교육 과정 / 교육 관리 / 참여 기업 연계 페이지가 모두 이 컴포넌트를 함께 쓴다 —
// 제목 + 설명 + 카드 목록으로 구성된 커스텀 페이지(완전히 새 탭)의 본문 카드와 똑같은 모양이다.

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon-map";
import type { CustomSection } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CustomSectionBlock({
  section,
  num,
  isFirst,
}: {
  section: CustomSection;
  num: number;
  isFirst: boolean;
}) {
  return (
    <section id={`custom-section-${section.id}`} className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
        {pad(num)}. {section.title || "(제목 없음)"}
      </h3>
      {section.description && (
        <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
          {section.description}
        </p>
      )}
      {section.items.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {section.items.map((item, idx) => (
            <Card key={idx}>
              {item.icon && <Icon name={item.icon} className="h-6 w-6 text-brand" />}
              {item.heading && (
                <p className={`font-bold text-neutral-900 dark:text-white ${item.icon ? "mt-3" : ""}`}>
                  {item.heading}
                </p>
              )}
              {item.body && (
                <p className="mt-1.5 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.body}
                </p>
              )}
              {item.image_url && (
                <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Image src={item.image_url} alt="" fill unoptimized className="object-cover" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
