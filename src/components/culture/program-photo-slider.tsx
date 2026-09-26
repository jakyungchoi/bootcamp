"use client";

// 교육 문화 프로그램 카드의 사진 영역. 사진이 없으면 기존처럼 안내 placeholder를 보여주고,
// 한 장이면 그 사진만, 여러 장이면 좌우 화살표 + 점 표시로 넘겨볼 수 있는 슬라이드로 보여준다.
// 여러 장일 때는 4초마다 자동으로도 다음 사진으로 넘어가고, 화살표/점을 직접 누르면 그 시점부터
// 다시 4초를 센다. (마우스를 올려두면 자동 넘김을 잠시 멈춘다)
// 사진이 바뀔 때는 뚝 끊기지 않도록, 사진들을 옆으로 나란히 늘어놓고 좌우로 미끄러지듯 이동시킨다.
// (마지막 사진 → 첫 사진으로 한 바퀴 돌아갈 때만, 전체 사진을 거꾸로 훑고 지나가는 어색한 움직임이
// 보이지 않도록 그 순간만 애니메이션 없이 순간 이동한다)

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/card";
import type { CultureProgramPhoto } from "@/lib/types";

const AUTO_ADVANCE_MS = 4000;

export function ProgramPhotoSlider({ photos }: { photos: CultureProgramPhoto[] }) {
  const urls = photos.map((p) => p.image_url).filter((u): u is string => Boolean(u));
  const count = urls.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  // count가 바뀌면(사진이 추가/삭제되면) 범위를 벗어나지 않도록 보정한다.
  const safeIndex = count > 0 ? index % count : 0;

  function moveTo(next: number, isWrap: boolean) {
    if (isWrap) {
      // 한 바퀴를 도는 순간에는 애니메이션을 잠깐 꺼서, 전체 사진을 거꾸로 스치는 움직임을 감춘다.
      setSkipTransition(true);
      setIndex(next);
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
    } else {
      setIndex(next);
    }
  }

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setTimeout(() => {
      const next = (safeIndex + 1) % count;
      moveTo(next, safeIndex === count - 1);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [safeIndex, paused, count]);

  if (count === 0) return <ImagePlaceholder />;

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${(safeIndex * 100) / count}%)`,
          transition: skipTransition ? "none" : "transform 450ms ease-in-out",
        }}
      >
        {urls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 다양한 비율의 업로드 이미지를 그대로 보여준다.
          <img key={i} src={url} alt="" className="h-full w-full shrink-0 object-cover" style={{ width: `${100 / count}%` }} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => moveTo((safeIndex - 1 + count) % count, safeIndex === 0)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            aria-label="이전 사진"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => moveTo((safeIndex + 1) % count, safeIndex === count - 1)}
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
