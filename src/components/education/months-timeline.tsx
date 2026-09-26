"use client";

// 개월차별 관리 — 왼쪽에 구간 이름을 두고 오른쪽에는 관리자가 이름 붙인 칸(예: "1개월차" ~
// "6개월차", "수료 이후")을 가로로 나열한 간트 차트 표를 그린 뒤, 각 구간이 등록된 칸만 색을
// 칠해서 가로로 이어진 막대처럼 보이게 한다. 칸을 클릭하면(사진이 등록되어 있을 때만) 사진을
// 좌우로 넘겨보는 팝업이 뜬다. 색상은 구간마다 관리자가 직접 고를 수 있고, 비워두면 자동으로
// 배정된다.

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { ManagementMonth } from "@/lib/types";

function columnRangeLabel(columns: string[], start: number, end: number) {
  const startLabel = columns[start - 1] ?? `${start}`;
  const endLabel = columns[end - 1] ?? `${end}`;
  return start === end ? startLabel : `${startLabel} ~ ${endLabel}`;
}

const PALETTE = ["#5b5bd6", "#0f172a", "#2563eb", "#0891b2", "#7c3aed", "#334155"];

export function MonthsTimeline({
  months,
  columns,
}: {
  months: ManagementMonth[];
  columns: string[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  // 표에 표시되는 줄 순서는 "시작 칸"이 아니라, 관리자 화면 아래쪽 "교육 과정 관리" 목록에서
  // 위/아래 화살표로 정한 순서(order)를 그대로 따른다. 시작 칸으로 자동 정렬하면 관리자가 일부러
  // 정해둔 줄 순서가 화면에서 뒤바뀌어 보이는 문제가 있었다.
  const sortedMonths = [...months].sort((a, b) => a.order - b.order);
  const openMonth = months.find((m) => m.id === openId) ?? null;

  const colorOf = (month: ManagementMonth, rowIdx: number) => month.color || PALETTE[rowIdx % PALETTE.length];

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-900 text-white dark:bg-neutral-950">
              <th className="w-44 min-w-[11rem] px-3 py-2 text-left text-xs font-medium">구간</th>
              {columns.map((label, i) => (
                <th key={i} className="px-1 py-2 text-center text-xs font-medium whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map((month, rowIdx) => {
              const color = colorOf(month, rowIdx);
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
                      {columnRangeLabel(columns, month.month_start, month.month_end)}
                      {hasPhotos && (
                        <span className="inline-flex items-center gap-0.5 text-brand">
                          <ImageIcon size={11} />
                          {month.photos.length}
                        </span>
                      )}
                    </p>
                  </td>
                  {columns.map((_, n0) => {
                    const n = n0 + 1;
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
          title={`${columnRangeLabel(columns, openMonth.month_start, openMonth.month_end)} · ${openMonth.title}`}
          items={openMonth.photos.map((p) => ({ image_url: p.image_url, description: p.caption }))}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
