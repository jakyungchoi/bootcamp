"use client";

// 교육 문화 프로그램 카드의 사진 영역. 사진이 없으면 기존처럼 안내 placeholder를 보여주고,
// 한 장이면 그 사진만, 여러 장이면 좌우 화살표 + 점 표시로 넘겨볼 수 있는 슬라이드로 보여준다.
// 여러 장일 때는 4초마다 자동으로도 다음 사진으로 넘어가고, 화살표/점을 직접 누르면 그 시점부터
// 다시 4초를 센다. (마우스를 올려두면 자동 넘김을 잠시 멈춘다)

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/card";
import type { CultureProgramPhoto } from "@/lib/types";

const AUTO_ADVANCE_MS = 4000;

export function ProgramPhotoSlider({ photos }: { photos: CultureProgramPhoto[] }) {
  const urls = photos.map((p) => p.image_url).filter((u): u is string => Boolean(u));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeIndex = urls.length > 0 ? index % urls.length : 0;

  useEffect(() => {
    if (urls.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
    // index를 의존성에 넣어서, 화살표/점을 직접 눌러 index가 바뀔 때마다 4초 타이머를 처음부터 다시 센다.
  }, [urls.length, paused, index]);

  if (urls.length === 0) return <ImagePlaceholder />;

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 다양한 비율의 업로드 이미지를 그대로 보여준다. */}
      <img src={urls[safeIndex]} alt="" className="h-full w-full object-cover" />

      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + urls.length) % urls.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            aria-label="이전 사진"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % urls.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            aria-label="다음 사진"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 사진`}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
