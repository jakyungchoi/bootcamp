// 시드/목업 콘텐츠
// - Supabase 연동 전에는 이 데이터로 화면을 그린다.
// - 이 파일의 구조는 supabase/schema.sql 의 테이블 구조와 1:1로 대응한다.
// - 관리자 페이지가 만들어지면 이 배열들은 DB row 로 옮겨가고, 이 파일은 fallback 용으로만 남는다.
// - 과정명 등 일부 항목은 실제 운영 내용을 알 수 없어 예시로 채워두었다. 관리자 페이지에서 실제 값으로 교체하면 된다.

import type {
  CollaborationTool,
  CompanyCaseStudy,
  CompanyFlowStep,
  CompanyParticipationType,
  Course,
  CourseCategory,
  CultureProgram,
  CurriculumFlowStep,
  LearnerManagementItem,
  PageHeader,
  PageHeaderKey,
  QualityManagementItem,
  SiteSettings,
  SupportPlanTrack,
} from "./types";

// 사이트 전역 설정의 기본값. 헤더 메뉴(nav_items)와 홈 화면 카드(home_highlights)는 서로 별개다.
export const siteSettings: SiteSettings = {
  site_name: "원티드랩 교육사업",
  logo_url: null,
  footer_description:
    "교육을 넘어, 실제 커리어로 연결되는 교육. 대학/기관, 참여 기업, 교육 관계자를 위한 원티드랩 교육사업 소개 페이지입니다.",
  home_hero_eyebrow: "Wanted Lab Education",
  home_hero_title: "교육을 넘어, 실제 커리어로 연결되는 교육",
  home_hero_subtitle:
    "직무 역량을 쌓고, 프로젝트를 경험하고, 현업과 연결되며 다음 커리어를 준비합니다.",
  home_hero_image_url: null,
  home_highlights: [
    {
      key: "courses",
      href: "/courses",
      title: "운영 교육 과정",
      eyebrow: "What we teach",
      description: "다양한 직무와 트랙의 실무 중심 교육을 제공합니다.",
    },
    {
      key: "management",
      href: "/education-management",
      title: "교육 관리",
      eyebrow: "How we operate",
      description: "체계적인 교육 관리와 품질 관리 시스템으로 안정적인 교육을 운영합니다.",
    },
    {
      key: "culture",
      href: "/culture",
      title: "교육 문화",
      eyebrow: "What makes us different",
      description: "원티드랩만의 교육 경험과 성장 문화를 제공합니다.",
    },
    {
      key: "partners",
      href: "/partners",
      title: "참여 기업 연계",
      eyebrow: "How we connect to industry",
      description: "기업의 현업 경험을 교육 과정에 연결합니다.",
    },
  ],
  nav_items: [
    { key: "courses", href: "/courses", title: "운영 교육 과정" },
    { key: "management", href: "/education-management", title: "교육 관리" },
    { key: "culture", href: "/culture", title: "교육 문화" },
    { key: "partners", href: "/partners", title: "참여 기업 연계" },
  ],
};

export const courseCategories: CourseCategory[] = [
  {
    id: "cat-ai",
    name: "AI / AX",
    slug: "ai-ax",
    topics: ["AI Agent", "생성형 AI", "AI 활용", "업무 자동화", "AX"],
    order: 1,
    is_published: true,
  },
  {
    id: "cat-dev",
    name: "개발",
    slug: "dev",
    topics: ["Backend", "Frontend", "Game Development", "C++", "Unreal Engine"],
    order: 2,
    is_published: true,
  },
  {
    id: "cat-career",
    name: "Career",
    slug: "career",
    topics: ["취업 역량", "프로젝트", "포트폴리오", "면접", "커리어 연계"],
    order: 3,
    is_published: true,
  },
];

export const curriculumFlowSteps: CurriculumFlowStep[] = [
  { id: "flow-1", order: 1, title: "기초 역량" },
  { id: "flow-2", order: 2, title: "직무 교육" },
  { id: "flow-3", order: 3, title: "실습" },
  { id: "flow-4", order: 4, title: "프로젝트" },
  { id: "flow-5", order: 5, title: "현업 피드백" },
  { id: "flow-6", order: 6, title: "취업 / 커리어 연계" },
];

// 예시 데이터 — 실제 과정명/내용은 관리자 페이지에서 교체
export const courses: Course[] = [
  {
    id: "course-ai-agent",
    category_id: "cat-ai",
    title: "AI Agent 개발 트랙",
    subtitle: "생성형 AI · 업무 자동화 · AX",
    description: "생성형 AI와 AI Agent를 활용해 실무 문제를 자동화하는 역량을 기른다.",
    highlights: ["생성형 AI 기초", "AI Agent 설계", "업무 자동화 실습", "AX 프로젝트"],
    project: "사내 업무 자동화 AI Agent 구축 프로젝트",
    image_url: null,
    detail_page_enabled: true,
    order: 1,
    is_published: true,
  },
  {
    id: "course-backend",
    category_id: "cat-dev",
    title: "Backend 개발 트랙",
    subtitle: "실무형 백엔드 개발자 양성",
    description: "서버, 데이터베이스, API 설계까지 실무 백엔드 개발 역량을 기른다.",
    highlights: ["서버/DB 기초", "API 설계", "배포 및 운영", "팀 프로젝트"],
    project: "실서비스 수준의 백엔드 시스템 구축",
    image_url: null,
    detail_page_enabled: true,
    order: 2,
    is_published: true,
  },
  {
    id: "course-frontend",
    category_id: "cat-dev",
    title: "Frontend 개발 트랙",
    subtitle: "실무형 프론트엔드 개발자 양성",
    description: "UI 구현부터 상태 관리, 성능 최적화까지 다룬다.",
    highlights: ["웹 표준/접근성", "컴포넌트 설계", "상태 관리", "팀 프로젝트"],
    project: "실서비스 수준의 웹 애플리케이션 구축",
    image_url: null,
    detail_page_enabled: true,
    order: 3,
    is_published: true,
  },
  {
    id: "course-game",
    category_id: "cat-dev",
    title: "Game Development (C++ / Unreal Engine)",
    subtitle: "게임 개발 실무 트랙",
    description: "C++와 Unreal Engine을 활용한 게임 개발 실무 역량을 기른다.",
    highlights: ["C++ 기초", "Unreal Engine", "게임 시스템 설계", "팀 프로젝트"],
    project: "팀 단위 미니 게임 제작",
    image_url: null,
    detail_page_enabled: true,
    order: 4,
    is_published: true,
  },
  {
    id: "course-career",
    category_id: "cat-career",
    title: "커리어 부스팅 트랙",
    subtitle: "취업 역량 · 포트폴리오 · 면접",
    description: "프로젝트를 포트폴리오로 완성하고 실전 취업 역량을 기른다.",
    highlights: ["포트폴리오 제작", "모의 면접", "현업 피드백", "커리어 연계"],
    project: "개인 포트폴리오 프로젝트",
    image_url: null,
    detail_page_enabled: true,
    order: 5,
    is_published: true,
  },
];

export const learnerManagementItems: LearnerManagementItem[] = [
  { id: "lm-attendance", title: "출결 관리", description: "출결 현황을 상시 확인하고 관리합니다.", icon: "CalendarCheck", order: 1, is_published: true },
  { id: "lm-participation", title: "학습 참여 관리", description: "학습 참여도를 추적하고 독려합니다.", icon: "Users", order: 2, is_published: true },
  { id: "lm-struggling", title: "학습부진자 관리", description: "학습에 어려움을 겪는 교육생을 조기에 발견하고 지원합니다.", icon: "LifeBuoy", order: 3, is_published: true },
  { id: "lm-status", title: "학습 현황 확인", description: "교육생별 학습 현황을 대시보드로 확인합니다.", icon: "LineChart", order: 4, is_published: true },
];

export const supportPlanTracks: SupportPlanTrack[] = [
  { id: "sp-common", track_name: "공통", items: ["출결 관리"], order: 1 },
  { id: "sp-track1", track_name: "1과정", items: ["학습부진자 지원"], order: 2 },
  {
    id: "sp-track2",
    track_name: "2과정",
    items: ["인프런 강의 제공", "현장 강의 녹화본 제공", "특강 제공"],
    order: 3,
  },
  { id: "sp-track3", track_name: "3과정", items: ["학습부진자 지원"], order: 4 },
];

export const qualityManagementItems: QualityManagementItem[] = [
  { id: "qm-1", group: "만족도 관리", title: "교육 만족도", description: "과정 전반에 대한 만족도를 조사합니다.", order: 1 },
  { id: "qm-2", group: "만족도 관리", title: "강사 만족도", description: "강사별 강의 만족도를 조사합니다.", order: 2 },
  { id: "qm-3", group: "만족도 관리", title: "프로젝트 만족도", description: "프로젝트 진행 과정의 만족도를 조사합니다.", order: 3 },
  { id: "qm-4", group: "만족도 관리", title: "과정별 만족도", description: "과정 단위로 만족도를 비교 관리합니다.", order: 4 },
  { id: "qm-5", group: "강사 관리", title: "강사 Pool", description: "검증된 강사 풀을 관리합니다.", order: 5 },
  { id: "qm-6", group: "강사 관리", title: "강사 평가", description: "정기적인 강사 평가를 진행합니다.", order: 6 },
  { id: "qm-7", group: "강사 관리", title: "강의 품질 관리", description: "강의 콘텐츠와 진행 품질을 관리합니다.", order: 7 },
  { id: "qm-8", group: "강사 관리", title: "피드백", description: "교육생 피드백을 강사에게 전달하고 반영합니다.", order: 8 },
];

export const collaborationTools: CollaborationTool[] = [
  { id: "tool-notion", name: "Notion", order: 1 },
  { id: "tool-slack", name: "Slack", order: 2 },
  { id: "tool-google", name: "Google Workspace", order: 3 },
  { id: "tool-github", name: "GitHub", order: 4 },
  { id: "tool-lms", name: "LMS", order: 5 },
];

export const cultureIntro =
  "원티드랩에서 교육을 받으면 무엇이 다른가를 보여주는 페이지입니다. 단순 교육 콘텐츠가 아니라 교육생의 성장과 커뮤니티 경험을 전달합니다.";

// 4개 주요 페이지 맨 위 영문 소제목 · 제목 · 설명 (관리자 페이지 "페이지 상단 문구"에서 수정)
export const pageHeaders: Record<PageHeaderKey, PageHeader> = {
  courses: {
    page_key: "courses",
    eyebrow: "What we teach",
    title: "운영 교육 과정",
    description: "원티드랩이 어떤 교육을 제공할 수 있는지 교육 영역과 교육 방식을 통해 보여줍니다.",
  },
  "education-management": {
    page_key: "education-management",
    eyebrow: "How we operate",
    title: "교육 관리",
    description:
      "교육생 관리, 학습부진자 관리, 강사 관리, 만족도 관리 등 교육을 어떻게 운영하고 품질을 관리하는지 보여줍니다.",
  },
  culture: {
    page_key: "culture",
    eyebrow: "What makes us different",
    title: "교육 문화",
    description: cultureIntro,
  },
  partners: {
    page_key: "partners",
    eyebrow: "How we connect to industry",
    title: "참여 기업 연계",
    description: "기업이 단순히 교육을 후원하는 것이 아니라, 교육 과정에 직접 참여할 수 있다는 점을 보여줍니다.",
  },
};

export const culturePrograms: CultureProgram[] = [
  {
    id: "culture-potenup",
    title: "인간 포텐업",
    subtitle: "원티드랩의 성장 프로그램",
    description: "교육생 개개인의 잠재력을 끌어올리는 원티드랩만의 성장 프로그램입니다.",
    highlights: ["진행 방식", "주요 활동", "성장 사례"],
    image_url: null,
    order: 1,
    is_published: true,
  },
  {
    id: "culture-knowledge",
    title: "지식줍줍 / 수료생 특강",
    subtitle: "현업 특강 · 지식 공유 · 네트워킹",
    description: "현업 실무자와 수료생의 특강을 통해 지식을 공유하고 네트워킹합니다.",
    highlights: ["현업 특강", "수료생 특강", "커뮤니티 네트워킹"],
    image_url: null,
    order: 2,
    is_published: true,
  },
  {
    id: "culture-mock-interview",
    title: "모의 면접",
    subtitle: "직무별 실전 면접 경험",
    description: "직무별 모의 면접을 통해 실전 감각을 기르고 피드백을 받습니다.",
    highlights: ["직무별 모의 면접", "실전 피드백", "개선 포인트 도출"],
    image_url: null,
    order: 3,
    is_published: true,
  },
  {
    id: "culture-way-of-work",
    title: "원티드 일하는 방식",
    subtitle: "문제 정의부터 AI 활용까지",
    description: "원티드랩의 실제 업무 방식을 교육 경험에 그대로 연결합니다.",
    highlights: ["문제 정의", "빠른 실행", "협업과 피드백", "AI 활용", "프로젝트 기반 업무"],
    image_url: null,
    order: 4,
    is_published: true,
  },
  {
    id: "culture-team-study",
    title: "팀 스터디",
    subtitle: "교육생 자발적 학습 커뮤니티",
    description: "교육생 간 자발적인 학습과 커뮤니티 형성을 지원하는 프로그램입니다.",
    highlights: ["자발적 스터디", "커뮤니티 형성"],
    image_url: null,
    order: 5,
    is_published: true,
  },
];

export const companyParticipationTypes: CompanyParticipationType[] = [
  { id: "cp-1", title: "프로젝트 주제 선정", description: "기업의 실제 문제를 프로젝트 주제로 제공", icon: "Lightbulb", order: 1, is_published: true },
  { id: "cp-2", title: "데이터 제공", description: "프로젝트에 활용할 수 있는 실제 또는 가공 데이터 제공", icon: "Database", order: 2, is_published: true },
  { id: "cp-3", title: "기자재 제공", description: "실습 및 프로젝트에 필요한 장비 제공", icon: "Server", order: 3, is_published: true },
  { id: "cp-4", title: "프로젝트 교과 강의", description: "기업 실무자가 프로젝트 관련 강의 진행", icon: "Presentation", order: 4, is_published: true },
  { id: "cp-5", title: "멘토링", description: "프로젝트 진행 과정에서 현업 멘토링", icon: "Users2", order: 5, is_published: true },
  { id: "cp-6", title: "특강", description: "기업 및 산업/직무 관련 특강", icon: "Mic2", order: 6, is_published: true },
  { id: "cp-7", title: "현장실습 제공", description: "교육 이후 실제 현업 경험으로 연결", icon: "Building2", order: 7, is_published: true },
];

export const companyFlowSteps: CompanyFlowStep[] = [
  { id: "cf-1", order: 1, title: "기업의 문제/수요" },
  { id: "cf-2", order: 2, title: "교육 과정 설계" },
  { id: "cf-3", order: 3, title: "프로젝트 주제 선정" },
  { id: "cf-4", order: 4, title: "데이터·현업 지식 제공" },
  { id: "cf-5", order: 5, title: "교육생 프로젝트" },
  { id: "cf-6", order: 6, title: "기업 멘토링" },
  { id: "cf-7", order: 7, title: "결과물 공유" },
  { id: "cf-8", order: 8, title: "현장실습·채용·커리어 연계" },
];

export const companyCaseStudies: CompanyCaseStudy[] = [];
