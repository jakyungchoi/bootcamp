"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";
import { ICON_OPTIONS } from "@/lib/icon-options";

export default function QualityManagementAdminPage() {
  const title = useAdminMenuLabel("quality-management", "교육 품질 관리");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-quality-management" }]}
    >
      <PageHeaderNote />
      <SectionCaptionEditor
        column="quality_management_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <ResourceCrud
        table="quality_process_steps"
        title="프로세스 흐름"
        description={`"${title}" 섹션 맨 위에 화살표로 이어지는 흐름으로 표시됩니다. (예: 경청 확인 → 데이터 분석 → 피드백 반영 → 다음 교육으로)`}
        publishable={false}
        titleField="title"
        fields={[{ key: "title", label: "단계 이름", type: "text", required: true }]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <SectionCaptionEditor
        column="quality_process_description"
        title="프로세스 흐름"
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <ResourceCrud
        table="quality_management_items"
        title={`${title} 카드`}
        description="프로세스 흐름 아래에 아이콘과 함께 표시되는 카드입니다. 개수 제한 없이 자유롭게 추가・삭제・순서 변경할 수 있고, 눈 아이콘으로 카드 하나하나를 숨기거나 다시 보여줄 수도 있습니다 (위 프로세스 흐름 내용만으로 충분하다면 카드를 전부 숨겨도 됩니다)."
        titleField="title"
        fields={[
          { key: "title", label: "제목", type: "text", required: true },
          { key: "description", label: "설명", type: "textarea" },
          { key: "icon", label: "아이콘", type: "select", options: ICON_OPTIONS },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
