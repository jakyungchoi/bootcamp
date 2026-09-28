// 교육 문화 프로그램 카드 / 오프라인 교육장의 사진 영역. 실제 슬라이드 로직은 공용 컴포넌트인
// SwipePhotoGallery(src/components/ui/swipe-photo-gallery.tsx)를 그대로 쓰고, 여기서는
// CultureProgramPhoto[] 형태(예: { image_url }[])를 URL 문자열 배열로 바꿔주기만 한다.

import { SwipePhotoGallery } from "@/components/ui/swipe-photo-gallery";
import type { CultureProgramPhoto } from "@/lib/types";

export function ProgramPhotoSlider({
  photos,
  aspectClassName = "aspect-[16/9]",
}: {
  photos: CultureProgramPhoto[];
  // 사진 영역의 가로세로 비율. 화면 폭 전체를 그대로 쓰는 곳(예: 오프라인 교육장)에서는 16:9로
  // 두면 세로로 너무 커 보여서, 그런 곳에는 더 넓적한 비율(예: "aspect-[21/9]")을 넘겨준다.
  aspectClassName?: string;
}) {
  const urls = photos.map((p) => p.image_url).filter((u): u is string => Boolean(u));
  return <SwipePhotoGallery urls={urls} aspectClassName={aspectClassName} autoAdvanceMs={2000} />;
}
