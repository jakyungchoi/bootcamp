// 참여 기업 연계 페이지 팝업 폼("참여 신청하기")이 제출하는 API.
// 브라우저는 구글 시트에 직접 접근하지 않고 이 서버 라우트에만 요청을 보내며,
// 이 라우트가 서비스 계정 인증을 거쳐 서버 대 서버로 구글 시트에 한 행을 기록한다.

import { NextResponse } from "next/server";
import { appendPartnersApplicationRow, isPartnersFormConfigured } from "@/lib/partners-submission";
import { getSiteSettings } from "@/lib/data";
import type { PartnersRequiredFields } from "@/lib/types";

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

// 형태만 확인한다 (문자열/배열인지). 실제로 값이 채워져 있어야 하는지는 관리자가 사이트 전역
// 설정에서 켜고 끈 필수 항목 설정(partners_required_fields)에 따라 아래에서 따로 확인한다.
function hasValidShape(body: unknown): body is ApplicationPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.companyName === "string" &&
    typeof b.contactName === "string" &&
    typeof b.department === "string" &&
    typeof b.position === "string" &&
    typeof b.email === "string" &&
    typeof b.phone === "string" &&
    Array.isArray(b.participationTypes) &&
    b.participationTypes.every((v) => typeof v === "string") &&
    typeof b.meetingMethod === "string" &&
    typeof b.request === "string" &&
    typeof b.message === "string"
  );
}

// 관리자가 필수로 켜둔 항목 중 비어 있는 게 있으면 그 항목의 한글 이름 목록을 돌려준다.
function findMissingFields(payload: ApplicationPayload, required: PartnersRequiredFields): string[] {
  const missing: string[] = [];
  if (required.companyName && !payload.companyName.trim()) missing.push("기업명");
  if (required.contactName && !payload.contactName.trim()) missing.push("담당자명");
  if (required.department && !payload.department.trim()) missing.push("부서");
  if (required.position && !payload.position.trim()) missing.push("직급/직책");
  if (required.email && !payload.email.trim()) missing.push("이메일");
  if (required.phone && !payload.phone.trim()) missing.push("연락처");
  if (required.participationTypes && payload.participationTypes.length === 0) missing.push("참여 희망 방식");
  if (required.meetingMethod && !payload.meetingMethod.trim()) missing.push("만남 방식");
  if (required.request && !payload.request.trim()) missing.push("문의/요청 내용");
  if (required.message && !payload.message.trim()) missing.push("남기실 말씀");
  return missing;
}

export async function POST(request: Request) {
  if (!isPartnersFormConfigured()) {
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

  if (!hasValidShape(body)) {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const missingFields = findMissingFields(body, settings.partners_required_fields);
  if (missingFields.length > 0) {
    return NextResponse.json(
      { ok: false, error: `다음 항목을 입력해주세요: ${missingFields.join(", ")}` },
      { status: 400 },
    );
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
