"use client";

// 개월차별 관리 카드. 등록된 사진(month.photos)이 있으면 클릭 시 좌우로 넘겨보는 팝업이 뜬다.

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CarouselModal } from "@/components/ui/carousel-modal";
import type { ManagementMonth } from "@/lib/types";

export function MonthCard({ month }: { month: ManagementMonth }) {
  const [open, setOpen] = useState(false);
  const hasPhotos = month.photos.length > 0;

  return (
    <>
      <Card
        className={hasPhotos ? "cursor-pointer transition-all hover:-translate-y-0.5" : ""}
      >
        <div
          role={hasPhotos ? "button" : undefined}
          tabIndex={hasPhotos ? 0 : undefined}
          onClick={hasPhotos ? () => setOpen(true) : undefined}
          onKeyDown={
            hasPhotos
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") setOpen(true);
                }
              : undefined
          }
        >
          <span className="inline-block rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
            {month.month_label}
          </span>
          <p className="mt-3 font-bold text-neutral-900 dark:text-white">{month.title}</p>
          {month.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {month.description}
            </p>
          )}
          {month.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {month.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {hasPhotos && (
            <p className="mt-3 text-xs font-semibold text-brand">
              사진 {month.photos.length}장 보기 →
            </p>
          )}
        </div>
      </Card>

      {open && hasPhotos && (
        <CarouselModal
          title={`${month.month_label} · ${month.title}`}
          items={month.photos.map((p) => ({ image_url: p.image_url, description: p.caption }))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
