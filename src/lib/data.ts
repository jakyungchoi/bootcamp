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
  CultureProgram,
  CurriculumFlowStep,
  CustomPage,
  LearnerManagementItem,
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
  courses,
  culturePrograms,
  curriculumFlowSteps,
  learnerManagementItems,
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
