"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function CollaborationToolsAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="collaboration_tools"
        title="협업 도구"
        description="교육 관리 페이지 '협업 환경'에 표시되는 도구 목록입니다. (예: Notion, Slack)"
        publishable={false}
        titleField="name"
        fields={[{ key: "name", label: "도구 이름", type: "text", required: true }]}
      />
    </div>
  );
}
