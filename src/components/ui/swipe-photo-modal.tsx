"use client";

// 사진을 "탭하면 뜨는 팝업"으로 보여줄 때 쓰는 모달. 내부의 실제 슬라이드는 인라인으로 바로
// 보여줄 때와 똑같은 SwipePhotoGallery를 그대로 써서, 좌우로 스와이프하고 마지막↔첫 사진이
// 자연스럽게 이어지는 느낌이 팝업 안에서도 동일하게 유지된다. (팝업 안에서는 사진을 일부러
// 자세히 보고 있는 중일 수 있어서 자동 넘김은 꺼둔다)

import { useEffect } from "react";
import { X } from "lucide-react";
import { SwipePhotoGallery } from "@/components/ui/swipe-photo-gallery";

export function SwipePhotoModal({ urls, onClose }: { urls: string[]; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (urls.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
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
        <SwipePhotoGallery urls={urls} aspectClassName="aspect-[4/3]" autoAdvance={false} />
      </div>
    </div>
  );
}
