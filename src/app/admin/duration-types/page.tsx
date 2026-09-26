"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function DurationTypesAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="course_duration_types"
        title="과정 기간 분류"
        description="운영 교육 과정 페이지 '03. 대표 교육 과정'에서 과정을 묶어 보여주는 기준입니다. (예: 단기 과정, 중장기 과정). 교육 영역 카테고리와는 별개의 분류입니다."
        fields={[
          { key: "name", label: "분류 이름", type: "text", required: true, placeholder: "예: 단기 과정" },
          { key: "slug", label: "슬러그 (영문, 공백 없이)", type: "text", required: true, placeholder: "예: short-term" },
        ]}
      />
    </div>
  );
}
