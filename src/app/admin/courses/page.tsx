"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ResourceCrud } from "@/components/admin/resource-crud";

export default function CoursesAdminPage() {
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[] | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase.from("course_categories").select("id, name").order("order");
      setCategoryOptions((data ?? []).map((c) => ({ value: c.id, label: c.name })));
    }
    load();
  }, []);

  if (!categoryOptions) {
    return <div className="py-10 text-center text-neutral-400"><Loader2 className="mx-auto animate-spin" /></div>;
  }

  return (
    <ResourceCrud
      table="courses"
      title="대표 교육 과정"
      description="운영 교육 과정 페이지 '03. 대표 교육 과정'에 표시되는 카드입니다."
      titleField="title"
      fields={[
        { key: "category_id", label: "교육 영역", type: "select", options: categoryOptions, required: true },
        { key: "title", label: "과정명", type: "text", required: true },
        { key: "subtitle", label: "부제목", type: "text" },
        { key: "description", label: "설명", type: "textarea" },
        { key: "highlights", label: "주요 교육 내용", type: "string-list", helpText: "한 줄에 하나씩 입력하세요." },
        { key: "project", label: "프로젝트 설명", type: "text" },
        { key: "image_url", label: "대표 이미지", type: "image" },
      ]}
    />
  );
}
