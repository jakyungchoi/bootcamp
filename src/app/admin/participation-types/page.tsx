"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

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
  return (
    <ResourceCrud
      table="company_participation_types"
      title="기업 참여 방식"
      description="참여 기업 연계 페이지 '01. 기업 참여 방식'에 표시되는 카드입니다."
      titleField="title"
      fields={[
        { key: "title", label: "제목", type: "text", required: true },
        { key: "description", label: "설명", type: "textarea" },
        { key: "icon", label: "아이콘", type: "select", options: ICON_OPTIONS },
      ]}
    />
  );
}
