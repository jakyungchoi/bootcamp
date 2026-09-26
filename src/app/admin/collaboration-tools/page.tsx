"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";

export default function CollaborationToolsAdminPage() {
  const title = useAdminMenuLabel("collaboration-tools", "협업 도구");
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="collaboration_tools"
        title={title}
        description="교육 관리 페이지 '협업 환경'에 표시되는 도구 목록입니다. (예: Notion, Slack)"
        publishable={false}
        titleField="name"
        fields={[{ key: "name", label: "도구 이름", type: "text", required: true }]}
      />
    </div>
  );
}
