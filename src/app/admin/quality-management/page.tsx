"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function QualityManagementAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="quality_management_items"
        title="교육 품질 관리"
        description="교육 관리 페이지 '03. 교육 품질 관리'에 표시되는 항목입니다. '구분'에 새 이름을 입력하면 새 카드가 만들어지고, 한 구분의 항목을 모두 지우면 그 카드는 사라집니다."
        publishable={false}
        titleField="title"
        fields={[
          {
            key: "group",
            label: "구분 (카드 제목)",
            type: "text",
            required: true,
            placeholder: "예: 만족도 관리, 강사 관리, 시설 관리 ...",
            helpText: "기존 카드에 추가하려면 같은 이름을 그대로 입력하세요.",
          },
          { key: "title", label: "항목 이름", type: "text", required: true },
          { key: "description", label: "설명", type: "textarea" },
        ]}
      />
    </div>
  );
}
