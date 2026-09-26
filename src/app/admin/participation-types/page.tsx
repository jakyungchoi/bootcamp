"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";
import { PartnersFormSettingsEditor } from "@/components/admin/partners-form-settings-editor";

const ICON_OPTIONS = [
  "Lightbulb",
  "Database",
  "Server",
  "Presentation",
  "Users2",
  "Mic2",
  "Building2",
  "CalendarCheck",
  "Users",
  "LifeBuoy",
  "LineChart",
].map((v) => ({ value: v, label: v }));

export default function ParticipationTypesAdminPage() {
  const title = useAdminMenuLabel("participation-types", "기업 참여 방식");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/partners#admin-section-participation-types" }]}
    >
      <PageHeaderNote />
      <SectionCaptionEditor
        column="participation_types_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
      <PartnersFormSettingsEditor onSaved={() => setRefreshToken((n) => n + 1)} />
      <ResourceCrud
        table="company_participation_types"
        title={title}
        description={`여기 등록한 제목은 참여 기업 연계 페이지에 카드로 표시되지 않고, "참여 신청하기" 팝업 폼의 "참여 희망 방식" 체크박스 목록에 그대로 쓰입니다. 설명/아이콘은 공개 화면에 표시되지 않는 내부 기록용입니다.`}
        titleField="title"
        fields={[
          { key: "title", label: "제목 (신청 폼 체크박스 항목)", type: "text", required: true },
          { key: "description", label: "설명 (내부 기록용, 공개 화면 미노출)", type: "textarea" },
          { key: "icon", label: "아이콘 (내부 기록용, 공개 화면 미노출)", type: "select", options: ICON_OPTIONS },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
