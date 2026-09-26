"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function CultureAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="culture_programs"
        title="교육 문화 프로그램"
        description="교육 문화 페이지에 표시되는 프로그램 카드입니다. (예: 인간 포텐업, 지식줍줍 등)"
        titleField="title"
        imageFolder="culture-programs"
        fields={[
          { key: "title", label: "프로그램 이름", type: "text", required: true },
          { key: "subtitle", label: "부제목", type: "text" },
          { key: "description", label: "설명", type: "textarea" },
          { key: "highlights", label: "주요 내용", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
          {
            key: "photos",
            label: "사진",
            type: "object-list",
            helpText:
              "사진은 한 장만 등록해도 되고, 여러 장을 등록하면 화면에서 좌우로 넘겨볼 수 있는 슬라이드로 표시됩니다.",
            subFields: [{ key: "image_url", label: "사진", type: "image" }],
          },
        ]}
      />
    </div>
  );
}
