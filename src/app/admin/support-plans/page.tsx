"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";

export default function SupportPlansAdminPage() {
  const title = useAdminMenuLabel("support-plans", "학습부진자 지도 계획");
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="support_plan_tracks"
        title={title}
        description={`교육 관리 페이지의 "${title}" 표에 표시되는 행입니다.`}
        publishable={false}
        titleField="track_name"
        fields={[
          { key: "track_name", label: "구분 (예: 공통, 1과정)", type: "text", required: true },
          { key: "items", label: "지원 방식", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
        ]}
      />
    </div>
  );
}
