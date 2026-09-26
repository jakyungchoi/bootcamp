"use client";

// 관리자 콘텐츠 관리 화면 옆에 붙이는 "실시간 미리보기" 패널.
// 실제 공개 페이지를 iframe으로 그대로 띄워서, 저장한 내용이 공개 화면에 어떻게 보이는지
// 다른 탭으로 이동하지 않고 바로 확인할 수 있게 한다. iframe 내부는 실제 페이지라
// 버튼 클릭(예: "참여 신청하기" 팝업)도 그대로 눌러볼 수 있다.

import { useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

export type PreviewOption = {
  label: string; // 드롭다운에 보여줄 이름 (예: "참여 기업 연계")
  path: string; // 실제 페이지 경로 (예: "/partners#admin-section-participation-types")
};

export type PagePreviewPanelProps = {
  options: PreviewOption[];
  refreshToken?: number; // 이 값이 바뀌면 미리보기를 자동으로 새로고침한다 (저장 성공 시 올려주면 됨)
};

export function PagePreviewPanel({ options, refreshToken }: PagePreviewPanelProps) {
  const [selectedPath, setSelectedPath] = useState(options[0]?.path ?? "/");
  // 수동 새로고침 버튼을 누른 횟수. refreshToken(저장 성공 시 부모가 올려주는 값)과 함께
  // iframe의 key로 사용해서, 두 경우 모두 iframe을 다시 불러오게 한다.
  const [manualNonce, setManualNonce] = useState(0);

  const publicOrigin = ""; // 같은 사이트 안이라 상대 경로만으로 충분하다.
  const externalHref = `${publicOrigin}${selectedPath}`;

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold text-neutral-500">실시간 미리보기 (실제 화면)</p>
        </div>
        <div className="flex items-center gap-1">
          {options.length > 1 && (
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="rounded-md border border-neutral-200 px-2 py-1 text-xs focus:border-brand focus:outline-none"
            >
              {options.map((opt) => (
                <option key={opt.path} value={opt.path}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setManualNonce((n) => n + 1)}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
            aria-label="미리보기 새로고침"
            title="새로고침"
          >
            <RefreshCw size={14} />
          </button>
          <a
            href={externalHref}
            target="_blank"
            rel="noreferrer"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
            aria-label="새 탭에서 열기"
            title="새 탭에서 열기"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <iframe
        key={`${selectedPath}-${refreshToken ?? 0}-${manualNonce}`}
        src={selectedPath}
        title="공개 화면 미리보기"
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
