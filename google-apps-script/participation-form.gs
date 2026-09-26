// 참여 기업 연계 페이지 "참여 신청하기" 팝업 폼이 보낸 내용을 구글 시트에 한 행씩 추가하는 코드.
//
// 사용 방법 (README.md의 "참여 신청 폼 → 구글 시트 연동 설정" 항목에 그림과 함께 자세히 설명):
// 1. 새 구글 시트를 만들고, 탭 이름을 "신청내역"으로 바꾼 뒤 1행에 아래 순서로 머리글을 입력한다.
//    제출일시 | 기업명 | 담당자명 | 부서 | 직급/직책 | 이메일 | 연락처 | 참여 희망 방식 | 만남 방식 | 문의/요청 내용 | 남기실 말씀
// 2. 그 시트에서 상단 메뉴 확장 프로그램 > Apps Script 를 연다.
// 3. 기본으로 열려 있는 코드를 모두 지우고 이 파일의 내용을 그대로 붙여넣은 뒤 저장한다.
// 4. 우측 상단 배포 > 새 배포 > 유형 선택(톱니바퀴)에서 "웹 앱" 선택.
//    - 실행 계정: 나
//    - 액세스 권한: 전체
//    배포를 누르고 권한을 요청하면 승인한다.
// 5. 배포 완료 후 나오는 "웹 앱 URL"을 복사해서, 사이트의 Vercel 환경 변수
//    PARTNERS_APPS_SCRIPT_URL 에 붙여넣고 재배포한다.
// 6. 코드를 다시 수정했다면 "새 배포"가 아니라 기존 배포에서 "관리 > 편집(연필 아이콘) > 새 버전"으로
//    배포해야 URL이 그대로 유지된다.

const SHEET_NAME = "신청내역";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const row = body.row;

    if (!Array.isArray(row)) {
      return jsonResponse({ ok: false, error: "잘못된 요청입니다." });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: `"${SHEET_NAME}" 탭을 찾을 수 없습니다.` });
    }

    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
