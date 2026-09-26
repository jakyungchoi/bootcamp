"use client";

// 콘텐츠 관리 화면(목록/편집 폼)과 "실시간 미리보기" 패널을 나란히 보여주는 레이아웃.
// 화면이 좁으면(태블릿/모바일) 미리보기가 아래로 내려가고, 버튼으로 접었다 펼 수 있다.

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PagePreviewPanel } from "./page-preview-panel";
import type { PreviewOption } from "./page-preview-panel";

export type AdminContentLayoutProps = {
  previewOptions: PreviewOption[];
  refreshToken?: number;
  children: React.ReactNode;
};

export function AdminContentLayout({ previewOptions, refreshToken, children }: AdminContentLayoutProps) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="lg:flex lg:items-start lg:gap-5">
      <div className="min-w-0 lg:flex-1">
        <div className="mb-3 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? "미리보기 숨기기" : "실시간 미리보기 보기"}
          </button>
        </div>
        {children}
      </div>
      {showPreview && (
        <div className="mt-6 h-[70vh] lg:sticky lg:top-4 lg:mt-0 lg:h-[calc(100vh-6rem)] lg:w-[420px] lg:shrink-0 lg:self-start">
          <PagePreviewPanel options={previewOptions} refreshToken={refreshToken} />
        </div>
      )}
    </div>
  );
}
