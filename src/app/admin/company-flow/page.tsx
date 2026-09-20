"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

export default function CompanyFlowAdminPage() {
  return (
    <ResourceCrud
      table="company_flow_steps"
      title="이런 협업이 가능해요"
      description="참여 기업 연계 페이지 '02. 이런 협업이 가능해요'에 표시되는 활동 목록입니다. 순서는 화면에 보이는 순서에만 영향을 줍니다."
      publishable={false}
      titleField="title"
      fields={[{ key: "title", label: "활동 이름", type: "text", required: true }]}
    />
  );
}
