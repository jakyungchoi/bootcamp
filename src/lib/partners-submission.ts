// 참여 기업 연계 페이지의 "참여 신청하기" 팝업 폼에서 제출된 내용을 실제로 어디에, 어떻게
// 기록할지 결정하는 곳. 지금은 신청량이 많지 않아 구글 앱스 스크립트(Apps Script) 웹 앱으로
// 전달하는 방식을 쓰고 있다.
//
// 나중에 신청량이 늘어나 구글 서비스 계정 + Sheets API로 직접 연동하는 방식으로 바꾸고 싶어지면,
// 이 파일 안의 두 함수(isPartnersFormConfigured / appendPartnersApplicationRow) 구현만 바꾸면
// 된다. API 라우트(src/app/api/partners-application/route.ts)나 팝업 폼 화면 쪽 코드는 이
// 파일이 내보내는 함수 이름과 동작(설정 여부 확인 / 한 행 추가하기)이 그대로이기 때문에 전혀
// 손댈 필요가 없다. 설정 방법은 README.md의 "참여 신청 폼 → 구글 시트 연동 설정" 항목을 참고한다.

// 구글 시트 1행에 아래 순서 그대로 머리글을 입력해두어야 한다. (README에도 동일하게 안내)
export const PARTNERS_SHEET_HEADER = [
  "제출일시",
  "기업명",
  "담당자명",
  "부서",
  "직급/직책",
  "이메일",
  "연락처",
  "참여 희망 방식",
  "만남 방식",
  "문의/요청 내용",
  "남기실 말씀",
];

// 앱스 스크립트 웹 앱 URL이 설정되어 있어야만 공개 화면에 "참여 신청하기" 버튼이 표시된다.
export function isPartnersFormConfigured(): boolean {
  return Boolean(process.env.PARTNERS_APPS_SCRIPT_URL);
}

// 팝업 폼에서 받은 값 한 행을 앱스 스크립트 웹 앱으로 전달한다. 앱스 스크립트가 그 값을
// 실제 구글 시트에 append 한다 (google-apps-script/participation-form.gs 참고).
export async function appendPartnersApplicationRow(row: string[]): Promise<void> {
  const url = process.env.PARTNERS_APPS_SCRIPT_URL;
  if (!url) {
    throw new Error("구글 앱스 스크립트 웹 앱 주소(PARTNERS_APPS_SCRIPT_URL)가 설정되지 않았습니다.");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
    redirect: "follow",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`구글 시트 기록에 실패했습니다 (HTTP ${res.status}). ${detail}`.trim());
  }

  // 앱스 스크립트가 JSON으로 { ok: false, error: "..." } 형태의 실패 응답을 줄 수 있어 확인한다.
  // (JSON이 아닌 응답을 주는 경우도 있어, 그때는 HTTP 상태가 정상이면 성공으로 본다)
  let payload: { ok?: boolean; error?: string } | null = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (payload && payload.ok === false) {
    throw new Error(payload.error ?? "구글 시트 기록에 실패했습니다.");
  }
}
