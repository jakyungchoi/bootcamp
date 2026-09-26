"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function CurriculumAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="curriculum_flow_steps"
        title="커리큘럼 구성 단계"
        description="운영 교육 과정 페이지 '02. 커리큘럼 구성'에 표시되는 흐름입니다. (예: 기초 역량 → 직무 교육 → ...)"
        publishable={false}
        fields={[{ key: "title", label: "단계 이름", type: "text", required: true }]}
      />
    </div>
  );
}
