// 데이터 접근 레이어
// Supabase 가 연결되어 있으면 실제 DB 에서 조회하고, 연결 전에는 content.ts 의 목업 데이터를 반환한다.
// 화면(page.tsx) 코드는 Supabase 연동 여부를 신경 쓰지 않고 이 함수들만 호출하면 된다.

import { isSupabaseConfigured, supabase } from "./supabase/client";
import type {
  CollaborationTool,
  CompanyCaseStudy,
  CompanyFlowStep,
  CompanyParticipationType,
  Course,
  CourseCategory,
  CourseDurationType,
  CultureProgram,
  CurriculumFlowStep,
  CustomPage,
  LearnerManagementItem,
  ManagementHighlight,
  ManagementMetric,
  ManagementMonth,
  PageHeader,
  PageHeaderKey,
  QualityManagementItem,
  SiteSettings,
  SupportPlanTrack,
} from "./types";
import {
  collaborationTools,
  companyCaseStudies,
  companyFlowSteps,
  companyParticipationTypes,
  courseCategories,
  courseDurationTypes,
  courses,
  culturePrograms,
  curriculumFlowSteps,
  learnerManagementItems,
  managementHighlights,
  managementMetrics,
  managementMonths,
  pageHeaders,
  qualityManagementItems,
  siteSettings,
  supportPlanTracks,
} from "./content";

export async function getCourseCategories(): Promise<CourseCategory[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("course_categories")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as CourseCategory[];
  }
  return courseCategories.filter((c) => c.is_published).sort((a, b) => a.order - b.order);
}

// 과정 기간 분류 (단기 과정 / 중장기 과정 등). 교육 영역 카테고리와는 별개의 분류축이다.
export async function getCourseDurationTypes(): Promise<CourseDurationType[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("course_duration_types")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as CourseDurationType[];
  }
  return courseDurationTypes.filter((d) => d.is_published).sort((a, b) => a.order - b.order);
}

export async function getCourses(): Promise<Course[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as Course[];
  }
  return courses.filter((c) => c.is_published).sort((a, b) => a.order - b.order);
}

export async function getCulturePrograms(): Promise<CultureProgram[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("culture_programs")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as CultureProgram[];
  }
  return culturePrograms.filter((c) => c.is_published).sort((a, b) => a.order - b.order);
}

export async function getCompanyParticipationTypes(): Promise<CompanyParticipationType[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("company_participation_types")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as CompanyParticipationType[];
  }
  return companyParticipationTypes.filter((c) => c.is_published).sort((a, b) => a.order - b.order);
}

export async function getCompanyFlowSteps(): Promise<CompanyFlowStep[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("company_flow_steps")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) return data as CompanyFlowStep[];
  }
  return [...companyFlowSteps].sort((a, b) => a.order - b.order);
}

export async function getCompanyCaseStudies(): Promise<CompanyCaseStudy[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("company_case_studies")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as CompanyCaseStudy[];
  }
  return companyCaseStudies.filter((c) => c.is_published).sort((a, b) => a.order - b.order);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (!error && data) {
      return {
        site_name: data.site_name,
        logo_url: data.logo_url,
        footer_description: data.footer_description,
        home_hero_eyebrow: data.home_hero_eyebrow ?? siteSettings.home_hero_eyebrow,
        home_hero_title: data.home_hero_title,
        home_hero_subtitle: data.home_hero_subtitle,
        home_hero_image_url: data.home_hero_image_url,
        home_highlights: data.home_highlights ?? siteSettings.home_highlights,
        nav_items: data.nav_items ?? siteSettings.nav_items,
        partners_form_url: data.partners_form_url ?? siteSettings.partners_form_url,
      };
    }
  }
  return siteSettings;
}

export async function getCurriculumFlowSteps(): Promise<CurriculumFlowStep[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("curriculum_flow_steps")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) return data as CurriculumFlowStep[];
  }
  return [...curriculumFlowSteps].sort((a, b) => a.order - b.order);
}

export async function getLearnerManagementItems(): Promise<LearnerManagementItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("learner_management_items")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as LearnerManagementItem[];
  }
  return learnerManagementItems.filter((i) => i.is_published).sort((a, b) => a.order - b.order);
}

export async function getSupportPlanTracks(): Promise<SupportPlanTrack[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("support_plan_tracks")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) return data as SupportPlanTrack[];
  }
  return [...supportPlanTracks].sort((a, b) => a.order - b.order);
}

// 교육 관리 페이지 상단 "숫자로 검증된 실제 결과" 카드 행
export async function getManagementMetrics(): Promise<ManagementMetric[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("management_metrics")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as ManagementMetric[];
  }
  return managementMetrics.filter((m) => m.is_published).sort((a, b) => a.order - b.order);
}

// 위 숫자 카드 아래의 어두운 강조 타일 (퍼센트 강조 또는 Reference 목록)
export async function getManagementHighlights(): Promise<ManagementHighlight[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("management_highlights")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as ManagementHighlight[];
  }
  return managementHighlights.filter((h) => h.is_published).sort((a, b) => a.order - b.order);
}

// 교육 관리 페이지 "개월차별 관리" 카드 (사진은 클릭 시 좌우로 넘겨보는 팝업으로 표시)
export async function getManagementMonths(): Promise<ManagementMonth[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("management_months")
      .select("*")
      .eq("is_published", true)
      .order("order", { ascending: true });
    if (!error && data) return data as ManagementMonth[];
  }
  return managementMonths.filter((m) => m.is_published).sort((a, b) => a.order - b.order);
}

export async function getQualityManagementItems(): Promise<QualityManagementItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("quality_management_items")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) return data as QualityManagementItem[];
  }
  return [...qualityManagementItems].sort((a, b) => a.order - b.order);
}

export async function getCollaborationTools(): Promise<CollaborationTool[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("collaboration_tools")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) return data as CollaborationTool[];
  }
  return [...collaborationTools].sort((a, b) => a.order - b.order);
}

// 4개 주요 페이지 맨 위 영문 소제목 · 제목 · 설명
export async function getPageHeader(pageKey: PageHeaderKey): Promise<PageHeader> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("page_headers")
      .select("*")
      .eq("page_key", pageKey)
      .maybeSingle();
    if (!error && data) return data as PageHeader;
  }
  return pageHeaders[pageKey];
}

// 관리자 대시보드에서 "숨기기" 처리한 기존 메뉴의 key 목록.
// 공개 페이지들은 이 값을 참고해서, 숨긴 메뉴에 해당하는 섹션 전체를 화면에서 감추고
// 남은 섹션의 번호(01, 02, ...)를 자동으로 다시 매긴다.
export async function getHiddenAdminKeys(): Promise<Set<string>> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("admin_menu_overrides")
      .select("key, is_visible")
      .eq("is_visible", false);
    if (!error && data) return new Set(data.map((d) => d.key as string));
  }
  return new Set();
}

// 관리자 대시보드에서 이름(레이블)을 바꾼 기존 메뉴 목록 (key -> 새 이름).
// 공개 페이지의 섹션 제목도 관리자 대시보드에서 바꾼 이름을 그대로 따라가도록 이 값을 사용한다.
export async function getAdminMenuLabels(): Promise<Map<string, string>> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("admin_menu_overrides").select("key, label");
    if (!error && data) {
      const map = new Map<string, string>();
      for (const row of data as { key: string; label: string | null }[]) {
        const label = row.label?.trim();
        if (label) map.set(row.key, label);
      }
      return map;
    }
  }
  return new Map();
}

// 관리자가 추가한 커스텀 페이지를 slug 로 조회 (공개된 것만). 없으면 null.
export async function getCustomPageBySlug(slug: string): Promise<CustomPage | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as CustomPage;
}
