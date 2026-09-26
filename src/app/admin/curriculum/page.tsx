"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";

export default function CurriculumAdminPage() {
  const title = useAdminMenuLabel("curriculum", "커리큘럼 구성 단계");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/courses#admin-section-curriculum" }]}
    >
      <PageHeaderNote />
      <ResourceCrud
        table="curriculum_flow_steps"
        title={title}
        description={`운영 교육 과정 페이지의 "${title}" 섹션에 표시되는 흐름입니다. (예: 기초 역량 → 직무 교육 → ...)`}
        publishable={false}
        fields={[{ key: "title", label: "단계 이름", type: "text", required: true }]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
