"use client";

// 협업 사례를 옆으로 슬라이드하며 보여주는 컴포넌트. 화살표를 누르면 카드 한 장 너비만큼 스크롤된다.

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, ImagePlaceholder } from "@/components/ui/card";
import type { CompanyCaseStudy } from "@/lib/types";

export function CaseStudySlider({ cases }: { cases: CompanyCaseStudy[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.clientWidth ?? el.clientWidth;
    el.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cases.map((c) => (
          <div
            key={c.id}
            data-card
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <Card className="h-full">
              <ImagePlaceholder />
              <p className="mt-3 text-xs font-semibold text-brand">{c.company_name}</p>
              <p className="mt-1 font-bold text-neutral-900 dark:text-white">{c.title}</p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{c.description}</p>
            </Card>
          </div>
        ))}
      </div>

      {cases.length > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/5"
            aria-label="이전"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/5"
            aria-label="다음"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
