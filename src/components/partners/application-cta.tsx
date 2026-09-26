"use client";

// "참여 신청하기" 버튼 + 팝업 폼을 함께 관리하는 작은 클라이언트 컴포넌트.
// 구글 시트 연동(서비스 계정)이 서버에 설정되어 있는지는 partners/page.tsx(서버 컴포넌트)가
// 미리 확인해서 이 컴포넌트 자체를 렌더링할지 말지로 결정한다.

import { useState } from "react";
import { ApplicationFormModal } from "@/components/partners/application-form-modal";
import type {
  PartnersCustomField,
  PartnersFieldLabels,
  PartnersFieldVisibility,
  PartnersRequiredFields,
} from "@/lib/types";

type ApplicationCtaProps = {
  participationOptions: string[];
  meetingOptions: string[];
  privacyNotice: string;
  submitNotice: string;
  requiredFields: PartnersRequiredFields;
  fieldLabels: PartnersFieldLabels;
  fieldVisibility: PartnersFieldVisibility;
  customFields: PartnersCustomField[];
};

export function ApplicationCta({
  participationOptions,
  meetingOptions,
  privacyNotice,
  submitNotice,
  requiredFields,
  fieldLabels,
  fieldVisibility,
  customFields,
}: ApplicationCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        참여 신청하기
      </button>
      {open && (
        <ApplicationFormModal
          participationOptions={participationOptions}
          meetingOptions={meetingOptions}
          privacyNotice={privacyNotice}
          submitNotice={submitNotice}
          requiredFields={requiredFields}
          fieldLabels={fieldLabels}
          fieldVisibility={fieldVisibility}
          customFields={customFields}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
