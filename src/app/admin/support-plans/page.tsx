"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";

export default function SupportPlansAdminPage() {
  const title = useAdminMenuLabel("support-plans", "학습부진자 지도 계획");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-support-plans" }]}
    >
      <PageHeaderNote />
      <SectionCaptionEditor
        column="support_plans_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
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
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
