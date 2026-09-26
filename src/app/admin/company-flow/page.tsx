"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";

export default function CompanyFlowAdminPage() {
  const title = useAdminMenuLabel("company-flow", "이런 협업이 가능해요");
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/partners#admin-section-company-flow" }]}
    >
      <PageHeaderNote />

      <SectionCaptionEditor
        column="company_flow_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />

      <ResourceCrud
        table="company_flow_steps"
        title={title}
        description={`참여 기업 연계 페이지의 "${title}" 섹션에 표시되는 활동 목록입니다. 순서는 화면에 보이는 순서에만 영향을 줍니다.`}
        publishable={false}
        titleField="title"
        fields={[{ key: "title", label: "활동 이름", type: "text", required: true }]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
