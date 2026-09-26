// 참여 기업 연계 페이지 팝업 폼("참여 신청하기")이 제출하는 API.
// 브라우저는 구글 시트에 직접 접근하지 않고 이 서버 라우트에만 요청을 보내며,
// 이 라우트가 서비스 계정 인증을 거쳐 서버 대 서버로 구글 시트에 한 행을 기록한다.

import { NextResponse } from "next/server";
import { appendPartnersApplicationRow, isPartnersFormConfigured } from "@/lib/partners-submission";
import { getSiteSettings } from "@/lib/data";
import type { PartnersFieldVisibility, PartnersRequiredFields } from "@/lib/types";

type CustomFieldValue = { id: string; label: string; value: string };

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
  customFields: CustomFieldValue[];
};

// 형태만 확인한다 (문자열/배열인지). 실제로 값이 채워져 있어야 하는지는 관리자가 설정한
// 필수 항목(partners_required_fields)과 표시 여부(partners_field_visibility)에 따라 아래에서
// 따로 확인한다.
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
    typeof b.message === "string" &&
    (b.customFields === undefined ||
      (Array.isArray(b.customFields) &&
        b.customFields.every(
          (v) =>
            v &&
            typeof v === "object" &&
            typeof (v as Record<string, unknown>).id === "string" &&
            typeof (v as Record<string, unknown>).value === "string",
        )))
  );
}

// 관리자가 필수로 켜둔 항목 중 비어 있는 게 있으면 그 항목의 한글 이름 목록을 돌려준다.
// 표시(visibility)를 꺼둔 항목은 폼에 애초에 보이지 않으니 필수 여부와 상관없이 건너뛴다.
function findMissingFields(
  payload: ApplicationPayload,
  required: PartnersRequiredFields,
  visibility: PartnersFieldVisibility,
): string[] {
  const missing: string[] = [];
  const check = (key: keyof PartnersRequiredFields, label: string, isEmpty: boolean) => {
    if (visibility[key] && required[key] && isEmpty) missing.push(label);
  };
  check("companyName", "기업명", !payload.companyName.trim());
  check("contactName", "담당자명", !payload.contactName.trim());
  check("department", "부서", !payload.department.trim());
  check("position", "직급/직책", !payload.position.trim());
  check("email", "이메일", !payload.email.trim());
  check("phone", "연락처", !payload.phone.trim());
  check("participationTypes", "참여 희망 방식", payload.participationTypes.length === 0);
  check("meetingMethod", "만남 방식", !payload.meetingMethod.trim());
  check("request", "문의/요청 내용", !payload.request.trim());
  check("message", "남기실 말씀", !payload.message.trim());
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
  const missingFields = findMissingFields(body, settings.partners_required_fields, settings.partners_field_visibility);

  // 관리자가 직접 추가한 항목 중 필수로 켜둔 게 비어 있는지도 함께 확인한다.
  // (custom field의 정의는 site_settings.partners_custom_fields가 기준이고, 폼이 보낸 값은
  // id로 매칭한다 — 방문자가 요청 자체를 조작해서 required 값을 바꿔 보내는 것을 막기 위함)
  const customValueById = new Map(body.customFields.map((f) => [f.id, f.value]));
  for (const field of settings.partners_custom_fields) {
    if (field.required && !(customValueById.get(field.id) ?? "").trim()) {
      missingFields.push(field.label || "추가 항목");
    }
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      { ok: false, error: `다음 항목을 입력해주세요: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  const submittedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  // 관리자가 표시를 꺼둔 기본 항목도 열 위치가 밀리지 않도록 빈 문자열로 그대로 채워서 보낸다.
  // 관리자가 추가한 항목(customFields)은 그 뒤에 site_settings에 저장된 순서 그대로 이어붙인다 —
  // 그래서 항목을 추가/삭제/순서 변경하면 구글 시트의 머리글 행도 같은 순서로 맞춰줘야 한다.
  const visibility = settings.partners_field_visibility;
  const customFieldValues = settings.partners_custom_fields.map((field) =>
    (customValueById.get(field.id) ?? "").trim(),
  );

  try {
    await appendPartnersApplicationRow([
      submittedAt,
      visibility.companyName ? body.companyName.trim() : "",
      visibility.contactName ? body.contactName.trim() : "",
      visibility.department ? body.department.trim() : "",
      visibility.position ? body.position.trim() : "",
      visibility.email ? body.email.trim() : "",
      visibility.phone ? body.phone.trim() : "",
      visibility.participationTypes ? body.participationTypes.join(", ") : "",
      visibility.meetingMethod ? body.meetingMethod.trim() : "",
      visibility.request ? body.request.trim() : "",
      visibility.message ? body.message.trim() : "",
      ...customFieldValues,
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
