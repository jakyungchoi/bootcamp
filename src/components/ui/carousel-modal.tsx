"use client";

// 좌우 화살표로 넘겨보는 팝업(모달). 과정 클릭 시 뜨는 "프로젝트 상세" 팝업과
// 개월차 클릭 시 뜨는 "사진" 팝업이 공통으로 사용한다.

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

export type CarouselItem = {
  image_url: string | null;
  title?: string;
  description?: string;
};

type CarouselModalProps = {
  title?: string;
  items: CarouselItem[];
  onClose: () => void;
};

export function CarouselModal({ title, items, onClose }: CarouselModalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length, onClose]);

  if (items.length === 0) return null;
  const current = items[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        {title && (
          <div className="border-b border-black/5 px-6 py-4 dark:border-white/10">
            <p className="font-bold text-neutral-900 dark:text-white">{title}</p>
          </div>
        )}

        <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800">
          {current.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- 다양한 비율의 업로드 이미지를 그대로 보여준다.
            <img
              src={current.image_url}
              alt={current.title ?? ""}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/10 to-neutral-100 text-neutral-300 dark:from-brand/15 dark:to-neutral-800">
              <ImageIcon size={40} />
            </div>
          )}

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
                aria-label="이전"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
                aria-label="다음"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {(current.title || current.description) && (
          <div className="px-6 py-4">
            {current.title && (
              <p className="font-bold text-neutral-900 dark:text-white">{current.title}</p>
            )}
            {current.description && (
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {current.description}
              </p>
            )}
          </div>
        )}

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-4">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-brand" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
