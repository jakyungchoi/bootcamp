"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { ManagementMonthsSettingsEditor } from "@/components/admin/management-months-settings-editor";

export default function ManagementMonthsAdminPage() {
  const title = useAdminMenuLabel("management-months", "개월차별 관리");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-management-months" }]}
    >
      <PageHeaderNote />
      <ManagementMonthsSettingsEditor onSaved={() => setRefreshToken((n) => n + 1)} />
      <ResourceCrud
        table="management_months"
        title={title}
        description="교육 관리 페이지에 가로 막대(타임라인)로 표시되는 구간입니다. 사진을 등록하면, 방문자가 막대를 클릭했을 때 좌우로 넘겨보는 팝업이 뜹니다. 공개 화면에는 아래 목록 순서가 아니라 '시작 개월차' 순서대로 왼쪽부터 표시됩니다."
        titleField="title"
        imageFolder="management-months"
        fields={[
          { key: "month_start", label: "시작 개월차 (예: 1)", type: "number", required: true },
          {
            key: "month_end",
            label: "종료 개월차 (한 개월만 해당하면 시작과 동일하게, 예: 1 또는 2)",
            type: "number",
            required: true,
          },
          { key: "title", label: "제목", type: "text", required: true },
          { key: "description", label: "설명", type: "textarea" },
          { key: "tags", label: "태그", type: "string-list", helpText: "한 줄에 하나씩 입력하세요. (예: 게임 프레임워크 모듈)" },
          {
            key: "photos",
            label: "사진 (클릭 시 팝업으로 좌우로 넘겨볼 수 있어요)",
            type: "object-list",
            subFields: [
              { key: "image_url", label: "사진", type: "image" },
              { key: "caption", label: "설명 (선택)", type: "text" },
            ],
          },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
