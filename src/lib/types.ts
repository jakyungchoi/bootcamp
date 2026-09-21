// 데이터 모델 타입 정의
// Supabase 테이블과 1:1로 대응되도록 설계 (추후 관리자 페이지 + DB 연동 시 그대로 사용)

export type CourseCategory = {
  id: string;
  name: string; // "AI / AX", "개발", "Career"
  slug: string;
  topics: string[]; // 카드에 표시되는 세부 토픽 목록
  order: number;
  is_published: boolean;
};

export type Course = {
  id: string;
  category_id: string; // CourseCategory.id
  title: string;
  subtitle: string;
  description: string;
  highlights: string[]; // 주요 교육 내용
  project: string; // 프로젝트 설명
  image_url: string | null;
  detail_page_enabled: boolean;
  order: number;
  is_published: boolean;
};

export type CultureProgram = {
  id: string;
  title: string; // 인간 포텐업, 지식줍줍 등
  subtitle: string;
  description: string;
  highlights: string[];
  image_url: string | null;
  order: number;
  is_published: boolean;
};

export type LearnerManagementItem = {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide-react 아이콘 이름
  order: number;
  is_published: boolean;
};

export type SupportPlanTrack = {
  id: string;
  track_name: string; // "1과정", "2과정", "3과정"
  items: string[];
  order: number;
};

export type QualityManagementItem = {
  id: string;
  group: string; // 자유 입력 (관리자 페이지에서 새 구분을 추가/삭제할 수 있다)
  title: string;
  description: string;
  order: number;
};

export type CollaborationTool = {
  id: string;
  name: string; // Notion, Slack, ...
  order: number;
};

export type CurriculumFlowStep = {
  id: string;
  order: number;
  title: string;
};

export type CompanyParticipationType = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  is_published: boolean;
};

export type CompanyFlowStep = {
  id: string;
  order: number;
  title: string;
};

export type CompanyCaseStudy = {
  id: string;
  company_name: string;
  title: string;
  description: string;
  image_url: string | null;
  order: number;
  is_published: boolean;
};

// 홈 화면 4개 핵심 영역 카드. 헤더 메뉴와는 별개로 관리한다.
export type HomeHighlight = {
  key: string;
  href: string;
  title: string;
  eyebrow: string;
  description: string;
};

// 헤더 상단 내비게이션 메뉴 항목. 홈 화면 카드(HomeHighlight)와 개수/구성이 달라도 된다.
export type NavItem = {
  key: string;
  href: string;
  title: string;
};

// 사이트 전역 설정 (로고, 사이트명, 홈 히어로 등). DB에는 항상 한 행만 존재한다.
export type SiteSettings = {
  site_name: string;
  logo_url: string | null;
  footer_description: string;
  home_hero_eyebrow: string;
  home_hero_title: string;
  home_hero_subtitle: string;
  home_hero_image_url: string | null;
  home_highlights: HomeHighlight[];
  nav_items: NavItem[];
};

// 4개 주요 페이지(운영 교육 과정 / 교육 관리 / 교육 문화 / 참여 기업 연계) 맨 위 문구
export type PageHeaderKey = "courses" | "education-management" | "culture" | "partners";

export type PageHeader = {
  page_key: string;
  eyebrow: string;
  title: string;
  description: string;
};

// 관리자 대시보드 탭(기존 고정 메뉴) 이름/순서/표시 여부 재정의
export type AdminMenuOverride = {
  key: string;
  label: string | null;
  order: number | null;
  is_visible: boolean | null;
};

// 관리자가 자유롭게 추가하는 커스텀 페이지(=새 탭). /pages/[slug] 로 공개된다.
export type CustomPageSection = {
  heading: string;
  body: string;
};

export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  sections: CustomPageSection[];
  order: number;
  is_published: boolean;
  created_at: string;
};

