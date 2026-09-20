"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

export default function CaseStudiesAdminPage() {
  return (
    <ResourceCrud
      table="company_case_studies"
      title="협업 사례"
      description="참여 기업 연계 페이지 '03. 협업 사례'에 표시되는 카드입니다. 실제 협업이 생기면 여기에 추가하세요."
      titleField="title"
      fields={[
        { key: "company_name", label: "기업명", type: "text", required: true },
        { key: "title", label: "제목", type: "text", required: true },
        { key: "description", label: "설명", type: "textarea" },
        { key: "image_url", label: "대표 이미지", type: "image" },
      ]}
    />
  );
}
