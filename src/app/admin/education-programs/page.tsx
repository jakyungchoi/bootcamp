"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { SectionCaptionEditor } from "@/components/admin/section-caption-editor";

export default function EducationProgramsAdminPage() {
  const title = useAdminMenuLabel("programs", "전체 교육 과정 개요");
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/courses#admin-section-programs" }]}
    >
      <PageHeaderNote />

      <SectionCaptionEditor
        column="programs_description"
        title={title}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />

      <ResourceCrud
        table="education_programs"
        title={title}
        description='운영 교육 과정 페이지 맨 위에 나열되는 전체 프로그램 목록입니다 (예: AX 챔피언, AX 해커톤, 커리어 교육, 부트캠프). 새 과정이 생기면 여기서 "추가"로 등록하면 되고, 코드를 고칠 필요는 없습니다. "메인으로 강조 표시"를 켠 과정 하나만 다른 과정보다 크게 강조되어 보이고, 그 아래 이어지는 "부트캠프 교육 영역" · "커리큘럼 구성" 섹션은 항상 그 과정을 기준으로 소개된다는 뜻입니다 (보통 부트캠프 과정 하나만 켜 두세요).'
        titleField="title"
        fields={[
          { key: "title", label: "과정 이름", type: "text", required: true, placeholder: "예: AX 챔피언" },
          {
            key: "duration_label",
            label: "기간 표시",
            type: "text",
            required: true,
            placeholder: "예: 4주 과정, 6개월 과정",
          },
          {
            key: "description",
            label: "설명",
            type: "textarea",
            required: true,
            helpText: "줄을 나누고 싶은 위치에서 Enter를 누르면 화면에도 그 위치에서 줄바꿈됩니다.",
          },
          {
            key: "is_main",
            label: "메인으로 강조 표시",
            type: "boolean",
            helpText:
              "켜두면 이 과정이 더 크게 강조되어 보이고, 아래 상세 섹션들이 이 과정을 기준으로 소개됩니다. 보통 부트캠프 과정에만 켜 두세요.",
          },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
