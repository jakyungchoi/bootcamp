"use client";

// 개월차별 관리 — 첨부해주신 간트 차트 사진처럼, 왼쪽에 구간 이름을 두고 오른쪽에는
// 전체 교육 기간(1~totalMonths)을 가로로 나열한 표를 그린 뒤, 각 구간이 등록된 개월(칸)만
// 색을 칠해서 가로로 이어진 막대처럼 보이게 한다. 칸을 클릭하면(사진이 등록되어 있을 때만)
// 사진을 좌우로 넘겨보는 팝업이 뜬다. 글씨는 굵게 강조하지 않고 차분한 무게로 맞췄다.

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { ManagementMonth } from "@/lib/types";

function monthRangeLabel(start: number, end: number) {
  return start === end ? `${start}개월차` : `${start}~${end}개월차`;
}

const PALETTE = ["#5b5bd6", "#0f172a", "#2563eb", "#0891b2", "#7c3aed", "#334155"];

export function MonthsTimeline({
  months,
  totalMonths,
}: {
  months: ManagementMonth[];
  totalMonths: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const total = Math.max(1, Math.round(totalMonths) || 1);
  const sortedMonths = [...months].sort((a, b) => a.month_start - b.month_start || a.order - b.order);
  const openMonth = months.find((m) => m.id === openId) ?? null;
  const monthNumbers = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-900 text-white dark:bg-neutral-950">
              <th className="w-44 min-w-[11rem] px-3 py-2 text-left text-xs font-medium">구간</th>
              {monthNumbers.map((n) => (
                <th key={n} className="px-1 py-2 text-center text-xs font-medium whitespace-nowrap">
                  {n}개월차
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map((month, rowIdx) => {
              const color = PALETTE[rowIdx % PALETTE.length];
              const hasPhotos = month.photos.length > 0;
              return (
                <tr
                  key={month.id}
                  onClick={hasPhotos ? () => setOpenId(month.id) : undefined}
                  tabIndex={hasPhotos ? 0 : undefined}
                  onKeyDown={
                    hasPhotos
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") setOpenId(month.id);
                        }
                      : undefined
                  }
                  className={`border-t border-black/5 dark:border-white/10 ${
                    rowIdx % 2 === 1 ? "bg-neutral-50 dark:bg-neutral-900/40" : "bg-white dark:bg-neutral-900"
                  } ${hasPhotos ? "cursor-pointer hover:bg-brand/5 dark:hover:bg-brand/10" : ""}`}
                >
                  <td className="px-3 py-2.5 align-top">
                    <p className="text-neutral-900 dark:text-white">{month.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                      {monthRangeLabel(month.month_start, month.month_end)}
                      {hasPhotos && (
                        <span className="inline-flex items-center gap-0.5 text-brand">
                          <ImageIcon size={11} />
                          {month.photos.length}
                        </span>
                      )}
                    </p>
                  </td>
                  {monthNumbers.map((n) => {
                    const inRange = n >= month.month_start && n <= month.month_end;
                    return (
                      <td key={n} className="p-1">
                        {inRange && <div className="h-5 rounded-sm" style={{ backgroundColor: color }} />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openMonth && openMonth.photos.length > 0 && (
        <CarouselModal
          title={`${monthRangeLabel(openMonth.month_start, openMonth.month_end)} · ${openMonth.title}`}
          items={openMonth.photos.map((p) => ({ image_url: p.image_url, description: p.caption }))}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
