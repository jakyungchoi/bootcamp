"use client";

// 개월차별 관리 — "로드맵처럼 보이고 싶다"는 요청에 맞춰, 가운데 가로선(트랙) 위에 구간마다
// 동그란 점(노드)을 찍고 그 위/아래로 번갈아가며 카드(기간 배지 + 제목 + 설명)를 붙이는
// 로드맵 형태로 구현한다. 트랙에서 구간 하나의 너비는 전체 교육 기간(totalMonths) 대비 그
// 구간(month_start~month_end)이 차지하는 개월 수에 비례한다. 카드나 점을 클릭하면(사진이
// 등록되어 있을 때만) 사진을 좌우로 넘겨보는 팝업이 뜬다.

import { useState } from "react";
import { ImageIcon } from "lucide-react";
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
// 연속으로 같은 카드(또는 빈 구간)가 이어지는 부분을 하나의 구간(Segment)으로 묶는다.
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

const PALETTE = ["#5b5bd6", "#0f172a", "#2563eb", "#0891b2", "#7c3aed", "#334155"];

function MonthCard({
  month,
  color,
  onOpen,
}: {
  month: ManagementMonth;
  color: string;
  onOpen: (id: string) => void;
}) {
  const hasPhotos = month.photos.length > 0;
  return (
    <button
      type="button"
      onClick={hasPhotos ? () => onOpen(month.id) : undefined}
      disabled={!hasPhotos}
      className={`w-full max-w-[220px] rounded-xl border border-black/5 bg-white p-3.5 text-left shadow-sm dark:border-white/10 dark:bg-neutral-900 ${
        hasPhotos ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
    >
      <span
        className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {monthRangeLabel(month.month_start, month.month_end)}
      </span>
      <p className="mt-2 text-sm font-bold text-neutral-900 dark:text-white">{month.title}</p>
      {month.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {month.description}
        </p>
      )}
      {hasPhotos && (
        <span className="mt-2 flex items-center gap-1 text-xs font-medium text-brand">
          <ImageIcon size={13} />
          사진 {month.photos.length}장 보기
        </span>
      )}
    </button>
  );
}

export function MonthsTimeline({
  months,
  totalMonths,
}: {
  months: ManagementMonth[];
  totalMonths: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const total = Math.max(1, Math.round(totalMonths) || 1);
  const segments = buildSegments(months, total);
  const sortedMonths = [...months].sort((a, b) => a.month_start - b.month_start || a.order - b.order);
  const openMonth = months.find((m) => m.id === openId) ?? null;

  // 각 구간(month)에 항상 같은 색이 배정되도록, 등장 순서(=시작 개월차 순서) 기준으로 색을 고른다.
  const colorOf = (id: string) => {
    const idx = sortedMonths.findIndex((m) => m.id === id);
    return PALETTE[(idx < 0 ? 0 : idx) % PALETTE.length];
  };

  // 실제로 등록된 구간에만 번갈아 위/아래 카드 배치를 정한다 (로드맵처럼 지그재그로 보이도록).
  // realOrder: 등록된 구간(월이 있는 세그먼트)만 순서대로 뽑은 원래 인덱스 목록.
  const realOrder = segments.map((seg, i) => (seg.month ? i : -1)).filter((i) => i !== -1);
  const alignments: ("top" | "bottom" | null)[] = segments.map((seg, i) => {
    if (!seg.month) return null;
    return realOrder.indexOf(i) % 2 === 0 ? "top" : "bottom";
  });

  const gridTemplateColumns = segments
    .map((seg) => (seg.month ? `minmax(150px, ${seg.span}fr)` : `minmax(10px, ${seg.span}fr)`))
    .join(" ");

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="grid gap-x-1.5" style={{ gridTemplateColumns, minWidth: 560 }}>
          {/* 위쪽 카드 줄 */}
          {segments.map((seg, i) => (
            <div key={`top-${seg.key}`} style={{ gridColumn: i + 1, gridRow: 1 }} className="flex items-end justify-center pb-2.5">
              {seg.month && alignments[i] === "top" && (
                <MonthCard month={seg.month} color={colorOf(seg.month.id)} onOpen={setOpenId} />
              )}
            </div>
          ))}

          {/* 가운데 트랙 + 노드 줄 (로드맵의 가로선) */}
          {segments.map((seg, i) => (
            <div key={`track-${seg.key}`} style={{ gridColumn: i + 1, gridRow: 2 }} className="relative flex h-4 items-center">
              <div
                className={`h-1.5 w-full rounded-full ${seg.month ? "" : "bg-neutral-200 dark:bg-neutral-700"}`}
                style={seg.month ? { backgroundColor: colorOf(seg.month.id) } : undefined}
              />
              {seg.month && (
                <button
                  type="button"
                  aria-label={`${monthRangeLabel(seg.month.month_start, seg.month.month_end)} · ${seg.month.title}`}
                  onClick={seg.month.photos.length > 0 ? () => setOpenId(seg.month!.id) : undefined}
                  disabled={seg.month.photos.length === 0}
                  className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm disabled:cursor-default dark:border-neutral-950"
                  style={{ backgroundColor: colorOf(seg.month.id) }}
                />
              )}
            </div>
          ))}

          {/* 아래쪽 카드 줄 */}
          {segments.map((seg, i) => (
            <div key={`bottom-${seg.key}`} style={{ gridColumn: i + 1, gridRow: 3 }} className="flex items-start justify-center pt-2.5">
              {seg.month && alignments[i] === "bottom" && (
                <MonthCard month={seg.month} color={colorOf(seg.month.id)} onOpen={setOpenId} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 전체 기간 스케일 안내 (트랙이 1개월차부터 전체 교육 기간까지임을 알려준다) */}
      <div className="mt-1 flex min-w-[560px] justify-between text-xs text-neutral-400">
        <span>1개월차</span>
        <span>총 {total}개월 과정</span>
        <span>{total}개월차</span>
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
