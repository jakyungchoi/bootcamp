"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

export default function CultureAdminPage() {
  return (
    <ResourceCrud
      table="culture_programs"
      title="교육 문화 프로그램"
      description="교육 문화 페이지에 표시되는 프로그램 카드입니다. (예: 인간 포텐업, 지식줍줍 등)"
      titleField="title"
      fields={[
        { key: "title", label: "프로그램 이름", type: "text", required: true },
        { key: "subtitle", label: "부제목", type: "text" },
        { key: "description", label: "설명", type: "textarea" },
        { key: "highlights", label: "주요 내용", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
        { key: "image_url", label: "대표 이미지", type: "image" },
      ]}
    />
  );
}
