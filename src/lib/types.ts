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

// 과정 기간 분류 (단기 과정 / 중장기 과정 등). 교육 영역 카테고리(CourseCategory)와는 별개의 분류축이다.
export type CourseDurationType = {
  id: string;
  name: string;
  slug: string;
  order: number;
  is_published: boolean;
};

// 과정 카드를 클릭했을 때 뜨는 팝업에서 좌우로 넘겨볼 수 있는 프로젝트 상세 항목
export type CourseProject = {
  title: string;
  description: string;
  image_url: string | null;
};

export type Course = {
  id: string;
  category_id: string; // CourseCategory.id
  duration_type_id: string | null; // CourseDurationType.id (선택 사항)
  title: string;
  subtitle: string;
  description: string;
  highlights: string[]; // 주요 교육 내용
  project: string; // 프로젝트 설명 (카드에 표시되는 한 줄 요약)
  projects: CourseProject[]; // 클릭 시 팝업으로 좌우로 넘겨볼 수 있는 프로젝트 상세 목록
  image_url: string | null;
  detail_page_enabled: boolean;
  order: number;
  is_published: boolean;
};

// 교육 문화 프로그램 카드의 사진 한 장 (여러 장 등록 시 좌우 슬라이드로 표시된다)
export type CultureProgramPhoto = {
  image_url: string | null;
};

export type CultureProgram = {
  id: string;
  title: string; // 인간 포텐업, 지식줍줍 등
  subtitle: string;
  description: string;
  highlights: string[];
  photos: CultureProgramPhoto[];
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

// 교육 관리 페이지 맨 위 "숫자로 검증된 실제 결과" 카드 행 (예: "99건" / "1·2기 누적 산출")
export type ManagementMetric = {
  id: string;
  value: string;
  label: string;
  order: number;
  is_published: boolean;
};

// 위 숫자 카드 아래의 어두운 강조 타일. "stat"은 큰 숫자+설명, "list"는 제목+목록(예: Reference) 형태다.
export type ManagementHighlight = {
  id: string;
  type: "stat" | "list";
  value: string; // type=stat 일 때 큰 숫자/퍼센트
  description: string; // type=stat 일 때 설명
  title: string; // type=list 일 때 제목 (예: Reference)
  items: string[]; // type=list 일 때 목록 항목
  order: number;
  is_published: boolean;
};

// 개월차별 관리 카드에서, 클릭했을 때 좌우로 넘겨보는 사진 한 장
export type ManagementMonthPhoto = {
  image_url: string | null;
  caption: string;
};

// 교육 관리 페이지 "개월차별 관리" 카드. 학습부진자 지도 계획(SupportPlanTrack)과는 별개의 새 섹션이다.
export type ManagementMonth = {
  id: string;
  month_label: string; // "1개월차" 등
  title: string;
  description: string;
  tags: string[];
  photos: ManagementMonthPhoto[];
  order: number;
  is_published: boolean;
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
  // 참여 신청 팝업 폼에서 쓰는 "만남 방식" 선택지 (라디오 버튼 목록)
  partners_meeting_options: string[];
  // 참여 신청 팝업 폼 하단에 보여줄 개인정보 수집·이용 동의 문구
  partners_privacy_notice: string;
  // 참여 신청 팝업 폼 제출 후 보여줄 안내 문구
  partners_submit_notice: string;
  // 참여 신청 팝업 폼의 각 항목을 필수로 받을지 선택 입력으로 둘지 (관리자 대시보드에서 켜고 끌 수 있다)
  partners_required_fields: PartnersRequiredFields;
  // 참여 기업 연계 페이지 "이런 협업이 가능해요" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  company_flow_description: string;
};

// 참여 신청 팝업 폼의 입력 항목 키. ApplicationFormModal / API 라우트가 이 키를 그대로 쓴다.
export type PartnersFormFieldKey =
  | "companyName"
  | "contactName"
  | "department"
  | "position"
  | "email"
  | "phone"
  | "participationTypes"
  | "meetingMethod"
  | "request"
  | "message";

export type PartnersRequiredFields = Record<PartnersFormFieldKey, boolean>;

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

