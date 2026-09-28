"use client";

// 관리자가 "새 섹션 추가"로 만든 커스텀 섹션을 공개 화면에 그려주는 공용 컴포넌트.
// 운영 교육 과정 / 교육 관리 / 참여 기업 연계 페이지가 모두 이 컴포넌트를 함께 쓴다 —
// 제목 + 설명 + 카드 목록으로 구성된 커스텀 페이지(완전히 새 탭)의 본문 카드와 똑같은 모양이다.

import { useState } from "react";
import { Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon-map";
import { SwipePhotoGallery } from "@/components/ui/swipe-photo-gallery";
import { SwipePhotoModal } from "@/components/ui/swipe-photo-modal";
import type { CustomSection, CustomSectionItem } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// 예전 버전에서는 사진 한 장만 image_url에 저장했다. 새 버전은 여러 장을 photos 배열에
// 저장하므로, 예전에 저장해둔 사진도 그대로 보이도록 photos가 비어있으면 image_url로 대신한다.
function photosOf(item: CustomSectionItem): string[] {
  const urls = (item.photos ?? []).map((p) => p.image_url).filter((u): u is string => Boolean(u));
  if (urls.length > 0) return urls;
  return item.image_url ? [item.image_url] : [];
}

function CustomSectionItemCard({ item }: { item: CustomSectionItem }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const photos = photosOf(item);
  const isPopup = item.photo_display === "popup";

  return (
    <Card>
      {item.icon && <Icon name={item.icon} className="h-6 w-6 text-brand" />}
      {item.heading && (
        <p className={`font-bold text-neutral-900 dark:text-white ${item.icon ? "mt-3" : ""}`}>{item.heading}</p>
      )}
      {item.body && (
        <p className="mt-1.5 whitespace-pre-line text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {item.body}
        </p>
      )}
      {photos.length > 0 &&
        (isPopup ? (
          <>
            <button
              type="button"
              onClick={() => setPopupOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <Images size={14} />
              사진 보기{photos.length > 1 ? ` (${photos.length}장)` : ""}
            </button>
            {popupOpen && <SwipePhotoModal urls={photos} onClose={() => setPopupOpen(false)} />}
          </>
        ) : (
          <div className="mt-3">
            <SwipePhotoGallery urls={photos} aspectClassName="aspect-[16/10]" />
          </div>
        ))}
    </Card>
  );
}

export function CustomSectionBlock({
  section,
  num,
  isFirst,
}: {
  section: CustomSection;
  num: number;
  isFirst: boolean;
}) {
  return (
    <section id={`custom-section-${section.id}`} className={`${isFirst ? "mt-14" : "mt-16"} scroll-mt-24`}>
      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
        {pad(num)}. {section.title || "(제목 없음)"}
      </h3>
      {section.description && (
        <p className="mt-2 whitespace-pre-line text-justify text-sm text-neutral-500 dark:text-neutral-400">
          {section.description}
        </p>
      )}
      {section.items.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {section.items.map((item, idx) => (
            <CustomSectionItemCard key={idx} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
