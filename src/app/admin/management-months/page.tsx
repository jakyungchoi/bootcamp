"use client";

import { useEffect, useState } from "react";
import { ResourceCrud, type FieldConfig } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { ManagementMonthsSettingsEditor } from "@/components/admin/management-months-settings-editor";
import { supabase } from "@/lib/supabase/client";

export default function ManagementMonthsAdminPage() {
  const title = useAdminMenuLabel("management-months", "개월차별 관리");
  const [refreshToken, setRefreshToken] = useState(0);
  // 위쪽 "간트 차트 칸 설정"에서 관리하는 칸 이름 목록을, 시작/종료 칸을 고르는 드롭다운의
  // 선택지로 그대로 쓴다. 칸을 추가/이름 변경/삭제하면(refreshToken 변경) 다시 불러온다.
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    async function loadColumns() {
      if (!supabase) return;
      const { data } = await supabase.from("site_settings").select("management_months_columns").eq("id", 1).maybeSingle();
      setColumns(
        data?.management_months_columns && data.management_months_columns.length > 0
          ? data.management_months_columns
          : ["1개월차", "2개월차", "3개월차", "4개월차", "5개월차", "6개월차"]
      );
    }
    loadColumns();
  }, [refreshToken]);

  const columnOptions = columns.map((label, i) => ({ value: String(i + 1), label: `${i + 1}. ${label}` }));

  const fields: FieldConfig[] = [
    {
      key: "month_start",
      label: "시작 칸",
      type: "select",
      options: columnOptions,
      numeric: true,
      required: true,
      helpText: "위 \"간트 차트 칸 설정\"에서 등록한 칸 이름이 목록으로 나옵니다.",
    },
    {
      key: "month_end",
      label: "종료 칸 (한 칸만 해당하면 시작 칸과 동일하게)",
      type: "select",
      options: columnOptions,
      numeric: true,
      required: true,
    },
    { key: "title", label: "제목", type: "text", required: true },
    { key: "description", label: "설명", type: "textarea" },
    { key: "color", label: "막대 색상", type: "color", helpText: "비워두면 자동으로 색이 배정됩니다." },
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
  ];

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
        description="교육 관리 페이지에 간트 차트 표로 표시되는 구간입니다. 사진을 등록하면, 방문자가 그 줄을 클릭했을 때 좌우로 넘겨보는 팝업이 뜹니다. 공개 화면에는 아래 목록의 ↑ / ↓ 순서 그대로 위에서부터 표시됩니다."
        titleField="title"
        imageFolder="management-months"
        fields={fields}
        onSaved={() => setRefreshToken((n) => n + 1)}
      />
    </AdminContentLayout>
  );
}
