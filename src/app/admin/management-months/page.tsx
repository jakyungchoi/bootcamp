"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";

export default function ManagementMonthsAdminPage() {
  return (
    <div>
      <PageHeaderNote />
      <ResourceCrud
        table="management_months"
        title="개월차별 관리"
        description="교육 관리 페이지에 개월차 단위로 표시되는 카드입니다. 사진을 등록하면, 방문자가 카드를 클릭했을 때 좌우로 넘겨보는 팝업이 뜹니다."
        titleField="month_label"
        imageFolder="management-months"
        fields={[
          { key: "month_label", label: "개월차 이름 (예: 1개월차)", type: "text", required: true },
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
      />
    </div>
  );
}
