"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";

export default function CategoriesAdminPage() {
  const title = useAdminMenuLabel("categories", "교육 영역 카테고리");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/courses#admin-section-categories" }]}
    >
      <PageHeaderNote />
      <ResourceCrud
        table="course_categories"
        title={title}
        description={`운영 교육 과정 페이지의 "${title}" 섹션에 표시되는 카드입니다. (예: AI / AX, 개발, Career)`}
        fields={[
          { key: "name", label: "카테고리 이름", type: "text", required: true, placeholder: "예: AI / AX" },
          { key: "slug", label: "슬러그 (영문, 공백 없이)", type: "text", required: true, placeholder: "예: ai-ax" },
          {
            key: "topics",
            label: "세부 토픽 목록",
            type: "string-list",
            helpText: "한 줄에 하나씩 입력하세요.",
          },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
