"use client";

import Link from "next/link";

const SECTIONS = [
  { href: "/admin/site-settings", title: "사이트 전역 설정", desc: "로고, 사이트 이름, 홈 화면 문구" },
  { href: "/admin/categories", title: "교육 영역 카테고리", desc: "AI/AX, 개발, Career 등 교육 영역" },
  { href: "/admin/courses", title: "대표 교육 과정", desc: "운영 교육 과정 페이지의 과정 카드" },
  { href: "/admin/curriculum", title: "커리큘럼 구성 단계", desc: "기초 역량 → 취업 연계 흐름" },
  { href: "/admin/culture", title: "교육 문화 프로그램", desc: "인간 포텐업, 지식줍줍 등" },
  { href: "/admin/learner-management", title: "학습자 관리 카드", desc: "출결, 학습 참여 등" },
  { href: "/admin/support-plans", title: "학습부진자 지도 계획", desc: "과정별 지원 방식" },
  { href: "/admin/quality-management", title: "교육 품질 관리", desc: "구분(카드)을 자유롭게 추가/삭제 가능" },
  { href: "/admin/collaboration-tools", title: "협업 도구", desc: "Notion, Slack 등" },
  { href: "/admin/participation-types", title: "기업 참여 방식", desc: "참여 기업 연계 페이지 카드" },
  { href: "/admin/company-flow", title: "이런 협업이 가능해요", desc: "기업과 함께할 수 있는 활동 목록" },
  { href: "/admin/case-studies", title: "협업 사례", desc: "실제 기업 협업 사례" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">관리자 대시보드</h1>
      <p className="mt-1 text-sm text-neutral-500">
        수정하고 싶은 화면을 선택하세요. 저장하면 공개 사이트에 바로 반영됩니다.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <p className="font-semibold text-neutral-800">{s.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
