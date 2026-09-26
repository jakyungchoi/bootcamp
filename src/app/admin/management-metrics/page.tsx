"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";

const HIGHLIGHT_TYPE_OPTIONS = [
  { value: "stat", label: "숫자 강조 (예: 87.5%)" },
  { value: "list", label: "목록 (예: Reference)" },
];

export default function ManagementMetricsAdminPage() {
  const title = useAdminMenuLabel("management-metrics", "교육 성과 지표");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-management-metrics" }]}
    >
      <div className="space-y-10">
        <PageHeaderNote />
        <ResourceCrud
          table="management_metrics"
          title={`${title} — 숫자 카드`}
          description="교육 관리 페이지 맨 위 '숫자로 검증된 실제 결과'에 한 줄로 표시되는 숫자 카드입니다. (예: 99건 / 1·2기 누적 산출)"
          titleField="label"
          fields={[
            { key: "value", label: "숫자 (예: 99건)", type: "text", required: true },
            { key: "label", label: "설명 (예: 1·2기 누적 산출)", type: "text", required: true },
          ]}
          onSaved={() => setRefreshToken((n) => n + 1)}
        />

        <ResourceCrud
          table="management_highlights"
          title={`${title} — 강조 타일`}
          description="숫자 카드 아래에 표시되는 어두운 타일입니다. '숫자 강조'는 큰 숫자+설명(예: 87.5%), '목록'은 제목+목록(예: Reference)입니다."
          titleField="value"
          fields={[
            { key: "type", label: "타일 종류", type: "select", options: HIGHLIGHT_TYPE_OPTIONS, required: true },
            { key: "value", label: "큰 숫자 (숫자 강조일 때, 예: 87.5%)", type: "text" },
            { key: "description", label: "설명 (숫자 강조일 때)", type: "textarea" },
            { key: "title", label: "제목 (목록일 때, 예: Reference)", type: "text" },
            { key: "items", label: "목록 항목 (목록일 때)", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
          ]}
          onSaved={() => setRefreshToken((n) => n + 1)}
        />
      </div>
    </AdminContentLayout>
  );
}
