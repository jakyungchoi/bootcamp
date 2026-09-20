"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

export default function SupportPlansAdminPage() {
  return (
    <ResourceCrud
      table="support_plan_tracks"
      title="학습부진자 지도 계획"
      description="교육 관리 페이지 '02. 학습부진자 지도 계획' 표에 표시되는 행입니다."
      publishable={false}
      titleField="track_name"
      fields={[
        { key: "track_name", label: "구분 (예: 공통, 1과정)", type: "text", required: true },
        { key: "items", label: "지원 방식", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
      ]}
    />
  );
}
