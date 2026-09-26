"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";

const ICON_OPTIONS = [
  "CalendarCheck",
  "Users",
  "LifeBuoy",
  "LineChart",
  "Lightbulb",
  "Database",
  "Server",
  "Presentation",
  "Users2",
  "Mic2",
  "Building2",
].map((v) => ({ value: v, label: v }));

export default function LearnerManagementAdminPage() {
  const title = useAdminMenuLabel("learner-management", "학습자 관리 카드");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-learner-management" }]}
    >
      <PageHeaderNote />
      <SectionCaptionEditor
        column="learner_management_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <ResourceCrud
        table="learner_management_items"
        title={title}
        description={`교육 관리 페이지의 "${title}" 섹션에 표시되는 카드입니다.`}
        titleField="title"
        fields={[
          { key: "title", label: "제목", type: "text", required: true },
          { key: "description", label: "설명", type: "textarea" },
          { key: "icon", label: "아이콘", type: "select", options: ICON_OPTIONS },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
