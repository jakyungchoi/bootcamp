"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

export default function CategoriesAdminPage() {
  return (
    <ResourceCrud
      table="course_categories"
      title="교육 영역 카테고리"
      description="운영 교육 과정 페이지 '01. 교육 영역'에 표시되는 카드입니다. (예: AI / AX, 개발, Career)"
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
    />
  );
}
