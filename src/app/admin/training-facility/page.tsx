"use client";

import { useState } from "react";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { TrainingFacilityEditor } from "@/components/admin/training-facility-editor";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";

export default function TrainingFacilityAdminPage() {
  const title = useAdminMenuLabel("training-facility", "오프라인 교육장");
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/education-management#admin-section-training-facility" }]}
    >
      <PageHeaderNote />
      <TrainingFacilityEditor onSaved={() => setRefreshToken((n) => n + 1)} />
    </AdminContentLayout>
  );
}
