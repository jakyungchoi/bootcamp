"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";

export default function CategoriesAdminPage() {
  const title = useAdminMenuLabel("categories", "부트캠프 교육 영역");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/courses#admin-section-categories" }]}
    >
      <PageHeaderNote />
      <SectionCaptionEditor
        column="categories_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <ResourceCrud
        table="course_categories"
        title={title}
        description={`운영 교육 과정 페이지의 "${title}" 섹션에서 그룹 제목으로 쓰입니다 (예: AI / AX, Game, FE/BE). 아래 "대표 교육 과정" 메뉴에서 각 과정 카드를 이 카테고리에 연결하면, 카드가 이 그룹 아래에 묶여서 보이고 세부 토픽 목록은 카드 하단에 태그로 표시됩니다.`}
        fields={[
          { key: "name", label: "카테고리 이름", type: "text", required: true, placeholder: "예: AI / AX" },
          { key: "slug", label: "슬러그 (영문, 공백 없이)", type: "text", required: true, placeholder: "예: ai-ax" },
          {
            key: "topics",
            label: "세부 토픽 목록 (과정 카드 하단에 태그로 표시됨)",
            type: "string-list",
            helpText: "한 줄에 하나씩 입력하세요.",
          },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
