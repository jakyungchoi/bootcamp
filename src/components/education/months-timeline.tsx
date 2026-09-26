"use client";

// 개월차별 관리 — 카드 목록 대신 가로 막대(타임라인) 그래프로 보여준다. 막대 하나의 너비는
// 전체 교육 기간(totalMonths) 대비 그 구간(month_start~month_end)이 차지하는 개월 수에
// 비례한다. 등록되지 않은 개월 구간은 얇은 회색 트랙으로 채워서 전체 기간이 한눈에 보이도록
// 한다. 막대를 클릭하면(사진이 등록되어 있을 때만) 기존과 같은 방식으로 사진을 좌우로
// 넘겨보는 팝업이 뜬다.

import { useState } from "react";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { ManagementMonth } from "@/lib/types";

function monthRangeLabel(start: number, end: number) {
  return start === end ? `${start}개월차` : `${start}~${end}개월차`;
}

type Segment = {
  key: string;
  month: ManagementMonth | null; // null이면 아직 등록되지 않은 빈 구간
  span: number;
};

// 1~totalMonths 개월을 순서대로 훑으면서, 어떤 카드가 그 개월을 덮고 있는지 표로 만든 뒤
// 연속으로 같은 카드(또는 빈 구간)가 이어지는 부분을 하나의 막대(Segment)로 묶는다.
function buildSegments(months: ManagementMonth[], totalMonths: number): Segment[] {
  const total = Math.max(1, Math.round(totalMonths) || 1);
  const coverage: (ManagementMonth | null)[] = Array(total).fill(null);
  const sorted = [...months].sort((a, b) => a.month_start - b.month_start || a.order - b.order);
  for (const m of sorted) {
    const start = Math.max(1, Math.min(m.month_start, total));
    const end = Math.max(start, Math.min(m.month_end, total));
    for (let i = start; i <= end; i++) {
      if (!coverage[i - 1]) coverage[i - 1] = m;
    }
  }

  const segments: Segment[] = [];
  let i = 0;
  while (i < total) {
    const current = coverage[i];
    let j = i;
    while (j < total && coverage[j] === current) j++;
    segments.push({ key: current ? current.id : `gap-${i}`, month: current, span: j - i });
    i = j;
  }
  return segments;
}

const PALETTE = [
  "bg-gradient-to-br from-brand to-neutral-900",
  "bg-gradient-to-br from-neutral-800 to-neutral-950",
];

export function MonthsTimeline({
  months,
  totalMonths,
}: {
  months: ManagementMonth[];
  totalMonths: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const segments = buildSegments(months, totalMonths);
  const openMonth = months.find((m) => m.id === openId) ?? null;

  return (
    <>
      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: segments
              .map((seg) => (seg.month ? `minmax(112px, ${seg.span}fr)` : `minmax(10px, ${seg.span}fr)`))
              .join(" "),
          }}
        >
          {segments.map((seg, i) => {
            if (!seg.month) {
              return (
                <div
                  key={seg.key}
                  className="h-2 self-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                  aria-hidden
                />
              );
            }
            const month = seg.month;
            const hasPhotos = month.photos.length > 0;
            return (
              <div
                key={seg.key}
                role={hasPhotos ? "button" : undefined}
                tabIndex={hasPhotos ? 0 : undefined}
                onClick={hasPhotos ? () => setOpenId(month.id) : undefined}
                onKeyDown={
                  hasPhotos
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") setOpenId(month.id);
                      }
                    : undefined
                }
                className={`flex min-h-[11rem] flex-col justify-between rounded-2xl p-4 text-white shadow-md transition-transform sm:min-h-[12rem] ${
                  PALETTE[i % PALETTE.length]
                } ${hasPhotos ? "cursor-pointer hover:-translate-y-0.5" : ""}`}
              >
                <div>
                  <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                    {monthRangeLabel(month.month_start, month.month_end)}
                  </span>
                  <p className="mt-2.5 break-keep font-bold leading-snug">{month.title}</p>
                  {month.description && (
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line break-keep text-xs leading-relaxed text-white/75">
                      {month.description}
                    </p>
                  )}
                </div>
                <div>
                  {month.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {month.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {hasPhotos && (
                    <p className="mt-2 text-[11px] font-semibold text-white/90">
                      사진 {month.photos.length}장 보기 →
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {openMonth && openMonth.photos.length > 0 && (
        <CarouselModal
          title={`${monthRangeLabel(openMonth.month_start, openMonth.month_end)} · ${openMonth.title}`}
          items={openMonth.photos.map((p) => ({ image_url: p.image_url, description: p.caption }))}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
