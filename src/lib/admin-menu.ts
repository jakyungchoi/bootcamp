// 관리자 대시보드 탭(메뉴) 목록을 만들어주는 헬퍼.
// - 기존 12개 고정 메뉴(BUILTIN_MENU)는 코드에 이름/순서가 정해져 있지만,
//   admin_menu_overrides 테이블에 저장된 값이 있으면 그 값으로 덮어쓴다. (이름 변경/순서 변경/숨기기)
// - 관리자가 새로 추가한 "커스텀 페이지"는 custom_pages 테이블에서 가져와 뒤에 이어붙인다. (완전한 추가/삭제)
// 관리자 대시보드(admin/page.tsx)와 사이드바(admin/layout.tsx)가 공통으로 이 함수를 사용한다.

import { supabase } from "./supabase/client";

export type BuiltinMenuItem = {
  key: string;
  href: string;
  label: string;
  desc: string;
  order: number;
};

export type MergedMenuItem = {
  key: string;
  href: string;
  label: string;
  desc?: string;
  order: number;
  isVisible: boolean;
  isCustom: boolean;
  slug?: string;
};

export const BUILTIN_MENU: BuiltinMenuItem[] = [
  { key: "site-settings", href: "/admin/site-settings", label: "사이트 전역 설정", desc: "로고, 사이트 이름, 홈 화면 문구", order: 1 },
  { key: "page-headers", href: "/admin/page-headers", label: "페이지 상단 문구", desc: "각 페이지 맨 위 영문 소제목 · 제목 · 설명", order: 2 },
  { key: "categories", href: "/admin/categories", label: "교육 영역 카테고리", desc: "AI/AX, 개발, Career 등 교육 영역", order: 3 },
  { key: "duration-types", href: "/admin/duration-types", label: "과정 기간 분류", desc: "단기 과정, 중장기 과정 등", order: 4 },
  { key: "courses", href: "/admin/courses", label: "대표 교육 과정", desc: "운영 교육 과정 페이지의 과정 카드", order: 5 },
  { key: "curriculum", href: "/admin/curriculum", label: "커리큘럼 구성 단계", desc: "기초 역량 → 취업 연계 흐름", order: 6 },
  { key: "culture", href: "/admin/culture", label: "교육 문화 프로그램", desc: "인간 포텐업, 지식줍줍 등", order: 7 },
  { key: "learner-management", href: "/admin/learner-management", label: "학습자 관리 카드", desc: "출결, 학습 참여 등", order: 8 },
  { key: "support-plans", href: "/admin/support-plans", label: "학습부진자 지도 계획", desc: "과정별 지원 방식", order: 9 },
  { key: "management-months", href: "/admin/management-months", label: "개월차별 관리", desc: "개월차 카드 + 클릭 시 사진 팝업", order: 10 },
  { key: "management-metrics", href: "/admin/management-metrics", label: "교육 성과 지표", desc: "상단 숫자 카드 + 강조 타일", order: 11 },
  { key: "quality-management", href: "/admin/quality-management", label: "교육 품질 관리", desc: "구분(카드)을 자유롭게 추가/삭제 가능", order: 12 },
  { key: "collaboration-tools", href: "/admin/collaboration-tools", label: "협업 도구", desc: "Notion, Slack 등", order: 13 },
  { key: "participation-types", href: "/admin/participation-types", label: "기업 참여 방식", desc: "참여 기업 연계 페이지 카드", order: 14 },
  { key: "company-flow", href: "/admin/company-flow", label: "이런 협업이 가능해요", desc: "기업과 함께할 수 있는 활동 목록", order: 15 },
  { key: "case-studies", href: "/admin/case-studies", label: "협업 사례", desc: "실제 기업 협업 사례 (슬라이드로 표시)", order: 16 },
];

export function customKeyToId(key: string): string {
  return key.replace(/^custom:/, "");
}

export async function getMergedAdminMenu(): Promise<MergedMenuItem[]> {
  if (!supabase) {
    return BUILTIN_MENU.map((b) => ({ ...b, isVisible: true, isCustom: false }));
  }

  const [{ data: overrides }, { data: customPages }] = await Promise.all([
    supabase.from("admin_menu_overrides").select("*"),
    supabase.from("custom_pages").select("id, title, slug, order").order("order", { ascending: true }),
  ]);

  const overrideMap = new Map(
    (overrides ?? []).map((o) => [o.key as string, o as { label: string | null; order: number | null; is_visible: boolean | null }])
  );

  const builtins: MergedMenuItem[] = BUILTIN_MENU.map((b) => {
    const o = overrideMap.get(b.key);
    return {
      key: b.key,
      href: b.href,
      label: o?.label?.trim() ? o.label : b.label,
      desc: b.desc,
      order: o?.order ?? b.order,
      isVisible: o?.is_visible ?? true,
      isCustom: false,
    };
  });

  const customs: MergedMenuItem[] = (customPages ?? []).map(
    (c: { id: string; title: string; slug: string; order: number }) => ({
      key: `custom:${c.id}`,
      href: `/admin/custom-pages/${c.id}`,
      label: c.title,
      order: 1000 + (c.order ?? 0),
      isVisible: true,
      isCustom: true,
      slug: c.slug,
    })
  );

  return [...builtins, ...customs].sort((a, b) => a.order - b.order);
}
