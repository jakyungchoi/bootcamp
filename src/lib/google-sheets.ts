// 참여 기업 연계 페이지의 "참여 신청하기" 팝업 폼에서 제출된 내용을 구글 시트에 한 행씩 쌓아준다.
//
// 외부(방문객 브라우저)에서 직접 구글 시트에 접근하지 않고, 반드시 이 서버 코드를 거쳐서만
// 기록되도록 서비스 계정(Google Cloud Service Account) + Sheets API 방식을 사용한다.
// 인증 정보(GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)와 시트 위치
// (GOOGLE_SHEETS_SPREADSHEET_ID / GOOGLE_SHEETS_SHEET_NAME)는 전부 서버 환경 변수로만 관리하며,
// 관리자 대시보드 화면이나 브라우저로 전달되는 값에는 절대 포함되지 않는다.
// 설정 방법은 README.md의 "참여 신청 폼 → 구글 시트 연동 설정" 항목을 참고한다.

import { JWT } from "google-auth-library";

const DEFAULT_SHEET_NAME = "신청내역";

function getPrivateKey(): string | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!raw) return null;
  // Vercel 등 환경 변수 입력창에 줄바꿈이 "\n" 문자 그대로(이스케이프된 채) 저장되는 경우가 많아
  // 실제 줄바꿈으로 되돌려준다. 이미 실제 줄바꿈으로 붙여넣은 경우에는 그대로 사용한다.
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

// 서버 환경 변수가 모두 설정되어 있는지 확인한다. 하나라도 비어 있으면 구글 시트 연동을
// 아직 쓸 수 없는 상태로 보고, 공개 화면에서도 "참여 신청하기" 버튼 자체를 숨긴다.
export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  );
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = getPrivateKey();
  if (!email || !key) {
    throw new Error("구글 서비스 계정 정보(GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)가 설정되지 않았습니다.");
  }
  const client = new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const { access_token: accessToken } = await client.authorize();
  if (!accessToken) throw new Error("구글 인증 토큰을 발급받지 못했습니다.");
  return accessToken;
}

// 참여 신청 팝업 폼에서 받은 값을 한 행으로 만들어 시트 맨 아래에 추가한다.
// 행의 열 순서는 README에 안내하는 시트 1행 머리글(제출일시 / 기업명 / 담당자명 / 부서 /
// 직급·직책 / 이메일 / 연락처 / 참여 희망 방식 / 만남 방식 / 문의·요청 내용 / 남기실 말씀)과
// 반드시 같은 순서여야 한다.
export async function appendPartnersApplicationRow(row: string[]): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("구글 시트 ID(GOOGLE_SHEETS_SPREADSHEET_ID)가 설정되지 않았습니다.");
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || DEFAULT_SHEET_NAME;

  const accessToken = await getAccessToken();
  const range = encodeURIComponent(`${sheetName}!A:A`);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`구글 시트 기록에 실패했습니다 (HTTP ${res.status}). ${detail}`.trim());
  }
}
