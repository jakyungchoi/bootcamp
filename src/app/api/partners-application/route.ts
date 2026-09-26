// 참여 기업 연계 페이지 팝업 폼("참여 신청하기")이 제출하는 API.
// 브라우저는 구글 시트에 직접 접근하지 않고 이 서버 라우트에만 요청을 보내며,
// 이 라우트가 서비스 계정 인증을 거쳐 서버 대 서버로 구글 시트에 한 행을 기록한다.

import { NextResponse } from "next/server";
import { appendPartnersApplicationRow, isGoogleSheetsConfigured } from "@/lib/google-sheets";

type ApplicationPayload = {
  companyName: string;
  contactName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  participationTypes: string[];
  meetingMethod: string;
  request: string;
  message: string;
};

function isValidPayload(body: unknown): body is ApplicationPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.companyName === "string" &&
    b.companyName.trim() !== "" &&
    typeof b.contactName === "string" &&
    b.contactName.trim() !== "" &&
    typeof b.department === "string" &&
    typeof b.position === "string" &&
    typeof b.email === "string" &&
    b.email.trim() !== "" &&
    typeof b.phone === "string" &&
    b.phone.trim() !== "" &&
    Array.isArray(b.participationTypes) &&
    b.participationTypes.every((v) => typeof v === "string") &&
    b.participationTypes.length > 0 &&
    typeof b.meetingMethod === "string" &&
    b.meetingMethod.trim() !== "" &&
    typeof b.request === "string" &&
    b.request.trim() !== "" &&
    typeof b.message === "string"
  );
}

export async function POST(request: Request) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { ok: false, error: "아직 구글 시트 연동이 설정되지 않았습니다. 관리자에게 문의해주세요." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ ok: false, error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }

  const submittedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  try {
    await appendPartnersApplicationRow([
      submittedAt,
      body.companyName.trim(),
      body.contactName.trim(),
      body.department.trim(),
      body.position.trim(),
      body.email.trim(),
      body.phone.trim(),
      body.participationTypes.join(", "),
      body.meetingMethod.trim(),
      body.request.trim(),
      body.message.trim(),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[partners-application] 구글 시트 기록 실패:", err);
    return NextResponse.json(
      { ok: false, error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 },
    );
  }
}
