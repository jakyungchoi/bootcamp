"use client";

// 교육 문화 프로그램 카드의 사진 영역. 사진이 없으면 기존처럼 안내 placeholder를 보여주고,
// 한 장이면 그 사진만, 여러 장이면 좌우 화살표 + 점 표시로 넘겨볼 수 있는 슬라이드로 보여준다.
// 여러 장일 때는 4초마다 자동으로도 다음 사진으로 넘어가고, 화살표/점을 직접 누르면 그 시점부터
// 다시 4초를 센다. (마우스를 올려두면 자동 넘김을 잠시 멈춘다)
//
// 사진이 바뀔 때는 뚝 끊기지 않도록, 사진들을 옆으로 나란히 늘어놓고 좌우로 미끄러지듯 이동시킨다.
// 마지막 사진 → 첫 사진으로 넘어갈 때도 계속 미끄러지는 느낌을 유지하기 위해, 실제 사진 목록
// 앞뒤에 "첫 사진/마지막 사진의 복사본"을 하나씩 몰래 붙여두고, 그 복사본까지 다 미끄러져 간
// 다음(사람 눈에는 보이지 않는 타이밍에) 애니메이션 없이 진짜 첫 사진/마지막 사진 위치로 순간
// 이동한다. (복사본 사진이 진짜 사진과 완전히 같은 그림이라 이 순간 이동은 눈에 띄지 않는다)

import { useEffect, useState } from "react";
import type { TransitionEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/card";
import type { CultureProgramPhoto } from "@/lib/types";

const AUTO_ADVANCE_MS = 4000;

export function ProgramPhotoSlider({ photos }: { photos: CultureProgramPhoto[] }) {
  const urls = photos.map((p) => p.image_url).filter((u): u is string => Boolean(u));
  const count = urls.length;

  // 사진이 2장 이상이면 맨 앞에 "마지막 사진의 복사본", 맨 뒤에 "첫 사진의 복사본"을 붙여서
  // 끝에서 끝으로 넘어갈 때도 계속 같은 방향으로 미끄러지는 것처럼 보이게 한다.
  const slides = count > 1 ? [urls[count - 1], ...urls, urls[0]] : urls;
  const totalSlides = slides.length;

  // trackIndex: 화면에 보여줄 슬라이드의 실제 위치 (count>1일 때 1..count가 진짜 사진, 0과
  // count+1은 복사본). 처음 렌더링될 때만 계산하면 충분하다.
  const [trackIndex, setTrackIndex] = useState(() => (count > 1 ? 1 : 0));
  const [paused, setPaused] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  // 점(dot) 표시는 복사본이 아니라 실제 사진 기준 번호로 보여줘야 한다.
  const realIndex =
    count <= 1 ? 0 : trackIndex === 0 ? count - 1 : trackIndex === totalSlides - 1 ? 0 : trackIndex - 1;

  function goNext() {
    setSkipTransition(false);
    setTrackIndex((i) => i + 1);
  }
  function goPrev() {
    setSkipTransition(false);
    setTrackIndex((i) => i - 1);
  }
  function goToReal(i: number) {
    setSkipTransition(false);
    setTrackIndex(i + 1);
  }

  // 복사본 위치까지 다 미끄러져 간 직후, 애니메이션 없이 진짜 사진 위치로 순간 이동시킨다.
  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "transform") return;
    if (trackIndex === totalSlides - 1) {
      setSkipTransition(true);
      setTrackIndex(1);
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
    } else if (trackIndex === 0) {
      setSkipTransition(true);
      setTrackIndex(count);
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
    }
  }

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setTimeout(() => {
      setSkipTransition(false);
      setTrackIndex((i) => i + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [trackIndex, paused, count]);

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
          width: `${totalSlides * 100}%`,
          transform: `translateX(-${(trackIndex * 100) / totalSlides}%)`,
          transition: skipTransition ? "none" : "transform 450ms ease-in-out",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 다양한 비율의 업로드 이미지를 그대로 보여준다.
          <img
            key={i}
            src={url}
            alt=""
            className="h-full w-full shrink-0 object-cover"
            style={{ width: `${100 / totalSlides}%` }}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            aria-label="이전 사진"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
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
                onClick={() => goToReal(i)}
                aria-label={`${i + 1}번째 사진`}
                className={`h-1.5 rounded-full transition-all ${
                  i === realIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
