"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";

export default function CaseStudiesAdminPage() {
  const title = useAdminMenuLabel("case-studies", "협업 사례");
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="company_case_studies"
        title={title}
        description={`참여 기업 연계 페이지의 "${title}" 섹션에 로고가 옆으로 계속 흐르는 형태로 표시됩니다. 실제 협업이 생기면 여기에 추가하세요. 공개 화면에는 로고 이미지만 보이고(마우스를 올리면 기업명이 말풍선으로 뜹니다), 제목/설명은 화면에 표시되지 않는 내부 기록용입니다.`}
        titleField="title"
        fields={[
          { key: "company_name", label: "기업명", type: "text", required: true, helpText: "로고에 마우스를 올렸을 때 뜨는 말풍선에 쓰입니다." },
          { key: "image_url", label: "로고 이미지", type: "image", helpText: "공개 화면에 실제로 보이는 이미지입니다. 등록하지 않으면 로고 자리에 기업명 글자만 표시됩니다." },
          { key: "title", label: "제목 (내부 기록용, 공개 화면 미노출)", type: "text", required: true },
          { key: "description", label: "설명 (내부 기록용, 공개 화면 미노출)", type: "textarea" },
        ]}
      />
    </div>
  );
}
