"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";

export default function CoursesAdminPage() {
  const title = useAdminMenuLabel("courses", "대표 교육 과정");
  const durationLabel = useAdminMenuLabel("duration-types", "과정 기간 분류");
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[] | null>(null);
  const [durationTypeOptions, setDurationTypeOptions] = useState<{ value: string; label: string }[] | null>(
    null
  );
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const [{ data: categories }, { data: durationTypes }] = await Promise.all([
        supabase.from("course_categories").select("id, name").order("order"),
        supabase.from("course_duration_types").select("id, name").order("order"),
      ]);
      setCategoryOptions((categories ?? []).map((c) => ({ value: c.id, label: c.name })));
      setDurationTypeOptions((durationTypes ?? []).map((d) => ({ value: d.id, label: d.name })));
    }
    load();
  }, []);

  if (!categoryOptions || !durationTypeOptions) {
    return <div className="py-10 text-center text-neutral-400"><Loader2 className="mx-auto animate-spin" /></div>;
  }

  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[{ label: title, path: "/courses#admin-section-courses" }]}
    >
      <PageHeaderNote />
      <ResourceCrud
        table="courses"
        title={title}
        description={`운영 교육 과정 페이지의 "${title}" 섹션에 표시되는 카드입니다. 과정 기간 분류는 "${durationLabel}" 메뉴에서 추가할 수 있습니다.`}
        titleField="title"
        fields={[
          { key: "category_id", label: "교육 영역", type: "select", options: categoryOptions, required: true },
          {
            key: "duration_type_id",
            label: "과정 기간 분류 (단기/중장기 등)",
            type: "select",
            options: durationTypeOptions,
            helpText: "선택하지 않아도 됩니다. 화면에서는 이 분류를 기준으로 과정이 묶여서 보여집니다.",
          },
          { key: "title", label: "과정명", type: "text", required: true },
          { key: "subtitle", label: "부제목", type: "text" },
          { key: "description", label: "설명", type: "textarea" },
          { key: "highlights", label: "주요 교육 내용", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
          { key: "project", label: "프로젝트 설명 (카드에 한 줄로 표시)", type: "text" },
          { key: "image_url", label: "대표 이미지", type: "image" },
          {
            key: "projects",
            label: "프로젝트 상세 (클릭 시 팝업으로 좌우로 넘겨볼 수 있어요)",
            type: "object-list",
            helpText: "여기에 항목을 추가하면, 방문자가 이 과정을 클릭했을 때 좌우 화살표로 넘겨보는 팝업이 뜹니다.",
            subFields: [
              { key: "title", label: "프로젝트 제목", type: "text" },
              { key: "description", label: "설명", type: "textarea" },
              { key: "image_url", label: "이미지", type: "image" },
            ],
          },
        ]}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
