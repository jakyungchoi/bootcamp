"use client";

// 개월차별 관리 — 왼쪽에 구간 이름을 두고 오른쪽에는 관리자가 이름 붙인 칸(예: "1개월차" ~
// "6개월차", "수료 이후")을 가로로 나열한 간트 차트 표를 그린 뒤, 각 구간이 등록된 칸만 색을
// 칠해서 가로로 이어진 막대처럼 보이게 한다. 사진은 구간 전체가 아니라 칸(열) 하나하나에
// 따로 등록되어 있어서(예: "프로젝트"가 1~6개월차에 걸쳐 있으면 6개 칸에 각각 다른 사진을
// 등록할 수 있다), 사진이 등록된 칸을 클릭하면 그 칸의 사진만 좌우로 넘겨보는 팝업이 뜬다.
// 색상은 구간마다 관리자가 직접 고를 수 있고, 비워두면 자동으로 배정된다.

import { useState } from "react";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { ManagementMonth } from "@/lib/types";

function columnRangeLabel(columns: string[], start: number, end: number) {
  const startLabel = columns[start - 1] ?? `${start}`;
  const endLabel = columns[end - 1] ?? `${end}`;
  return start === end ? startLabel : `${startLabel} ~ ${endLabel}`;
}

const PALETTE = ["#5b5bd6", "#0f172a", "#2563eb", "#0891b2", "#7c3aed", "#334155"];

type OpenCell = { monthId: string; column: number };

export function MonthsTimeline({
  months,
  columns,
}: {
  months: ManagementMonth[];
  columns: string[];
}) {
  const [openCell, setOpenCell] = useState<OpenCell | null>(null);
  // 표에 표시되는 줄 순서는 "시작 칸"이 아니라, 관리자 화면 아래쪽 "교육 과정 관리" 목록에서
  // 위/아래 화살표로 정한 순서(order)를 그대로 따른다. 시작 칸으로 자동 정렬하면 관리자가 일부러
  // 정해둔 줄 순서가 화면에서 뒤바뀌어 보이는 문제가 있었다.
  const sortedMonths = [...months].sort((a, b) => a.order - b.order);
  const openMonth = months.find((m) => m.id === openCell?.monthId) ?? null;
  const openPhotos = openMonth?.cell_photos.find((c) => c.column === openCell?.column)?.photos ?? [];

  const colorOf = (month: ManagementMonth, rowIdx: number) => month.color || PALETTE[rowIdx % PALETTE.length];

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-700 text-white dark:bg-neutral-800">
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
              return (
                <tr
                  key={month.id}
                  className={`border-t border-black/5 dark:border-white/10 ${
                    rowIdx % 2 === 1 ? "bg-neutral-50 dark:bg-neutral-900/40" : "bg-white dark:bg-neutral-900"
                  }`}
                >
                  <td className="px-3 py-2.5 align-top">
                    <p className="text-neutral-900 dark:text-white">{month.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {columnRangeLabel(columns, month.month_start, month.month_end)}
                    </p>
                  </td>
                  {columns.map((_, n0) => {
                    const n = n0 + 1;
                    const inRange = n >= month.month_start && n <= month.month_end;
                    const cellPhotos = month.cell_photos.find((c) => c.column === n)?.photos ?? [];
                    const hasCellPhotos = inRange && cellPhotos.length > 0;
                    return (
                      <td key={n} className="p-1">
                        {inRange && (
                          <div
                            onClick={hasCellPhotos ? () => setOpenCell({ monthId: month.id, column: n }) : undefined}
                            role={hasCellPhotos ? "button" : undefined}
                            tabIndex={hasCellPhotos ? 0 : undefined}
                            onKeyDown={
                              hasCellPhotos
                                ? (e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      setOpenCell({ monthId: month.id, column: n });
                                    }
                                  }
                                : undefined
                            }
                            aria-label={hasCellPhotos ? `${columns[n0]} 사진 보기` : undefined}
                            className={`relative flex h-5 items-center justify-center rounded-sm ${
                              hasCellPhotos ? "cursor-pointer hover:brightness-110" : ""
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {hasCellPhotos && (
                              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-white/80" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-neutral-400">사진이 등록된 칸(오른쪽 위 작은 점 표시)을 클릭하면 사진을 볼 수 있습니다.</p>

      {openMonth && openCell && openPhotos.length > 0 && (
        <CarouselModal
          title={`${columns[openCell.column - 1] ?? ""} · ${openMonth.title}`}
          items={openPhotos.map((p) => ({ image_url: p.image_url, description: p.caption }))}
          onClose={() => setOpenCell(null)}
        />
      )}
    </div>
  );
}
