"use client";

import { ResourceCrud } from "@/components/admin/resource-crud";

const ICON_OPTIONS = [
  "CalendarCheck",
  "Users",
  "LifeBuoy",
  "LineChart",
  "Lightbulb",
  "Database",
  "Server",
  "Presentation",
  "Users2",
  "Mic2",
  "Building2",
].map((v) => ({ value: v, label: v }));

export default function LearnerManagementAdminPage() {
  return (
    <ResourceCrud
      table="learner_management_items"
      title="학습자 관리 카드"
      description="교육 관리 페이지 '01. 학습자 관리'에 표시되는 카드입니다."
      titleField="title"
      fields={[
        { key: "title", label: "제목", type: "text", required: true },
        { key: "description", label: "설명", type: "textarea" },
        { key: "icon", label: "아이콘", type: "select", options: ICON_OPTIONS },
      ]}
    />
  );
}
