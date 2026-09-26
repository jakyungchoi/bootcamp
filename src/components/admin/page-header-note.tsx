// 이 화면에서 관리하는 콘텐츠(카드/목록 등)와, 그 페이지 맨 위에 나오는 영문 소제목·큰 제목·설명 문단은
// 서로 다른 곳에서 관리된다. 관리자가 "페이지 맨 위 설명 문구를 어디서 고치는지 못 찾겠다"고 한 데서 추가된
// 안내문 — 관련된 콘텐츠 관리 화면 맨 위에 공통으로 붙여서, "페이지 상단 문구" 메뉴로 바로 이동할 수 있게 한다.

import Link from "next/link";

export function PageHeaderNote() {
  return (
    <p className="mb-5 rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs leading-relaxed text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
      이 화면 바로 위, 페이지 맨 위에 나오는 영문 소제목 · 큰 제목 · 그 아래 설명 문단은 여기가 아니라{" "}
      <Link href="/admin/page-headers" className="font-semibold underline">
        페이지 상단 문구
      </Link>{" "}
      메뉴에서 수정합니다.
    </p>
  );
}
