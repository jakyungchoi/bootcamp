"use client";

import { useState } from "react";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";

export default function DurationTypesAdminPage() {
  const title = useAdminMenuLabel("duration-types", "과정 기간 분류");
  const coursesLabel = useAdminMenuLabel("courses", "대표 교육 과정");
  const categoriesLabel = useAdminMenuLabel("categories", "교육 영역 카테고리");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: coursesLabel, path: "/courses#admin-section-courses" }]}
    >
      <PageHeaderNote />
      <ResourceCrud
        table="course_duration_types"
        title={title}
        description={`운영 교육 과정 페이지의 "${coursesLabel}" 섹션에서 과정을 묶어 보여주는 기준입니다. (예: 단기 과정, 중장기 과정). "${categoriesLabel}"와는 별개의 분류입니다.`}
        fields={[
          { key: "name", label: "분류 이름", type: "text", required: true, placeholder: "예: 단기 과정" },
          { key: "slug", label: "슬러그 (영문, 공백 없이)", type: "text", required: true, placeholder: "예: short-term" },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
