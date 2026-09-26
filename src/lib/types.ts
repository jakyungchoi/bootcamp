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
// 공개 화면에서는 카드가 아니라 가로 타임라인(막대 그래프) 형태로 표시되며, month_start~month_end
// 구간의 길이에 비례해 막대 너비가 정해진다. (예: month_start=1, month_end=2 → "1~2개월차")
export type ManagementMonth = {
  id: string;
  month_start: number; // 시작 개월차 (예: 1)
  month_end: number; // 종료 개월차 (한 개월만 해당하면 month_start와 동일하게, 예: 1)
  title: string;
  description: string;
  tags: string[];
  photos: ManagementMonthPhoto[];
  order: number;
  is_published: boolean;
};

// 교육 관리 페이지 "오프라인 교육장" 섹션에 슬라이드로 표시되는 사진 한 장
export type TrainingFacilityPhoto = {
  image_url: string | null;
};

// "오프라인 교육장" 섹션 하단에 표시되는 짧은 특징 카드 (제목 + 한 줄 설명). 관리자가 자유롭게 추가/삭제 가능.
export type TrainingFacilityHighlight = {
  id: string;
  title: string;
  description: string;
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
  // 참여 신청 팝업 폼의 각 항목에 실제로 표시되는 이름(라벨) 문구 (관리자 대시보드에서 자유롭게 수정 가능)
  partners_field_labels: PartnersFieldLabels;
  // 참여 신청 팝업 폼의 기본 제공 항목을 폼에서 완전히 숨길지 여부 (끄면 "삭제"한 것처럼 폼에 아예 안 보인다)
  partners_field_visibility: PartnersFieldVisibility;
  // 관리자가 자유롭게 추가한 참여 신청 팝업 폼의 추가 항목 (단순 한 줄 입력)
  partners_custom_fields: PartnersCustomField[];
  // 참여 기업 연계 페이지 "이런 협업이 가능해요" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  company_flow_description: string;
  // 참여 기업 연계 페이지 "협업 사례" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  case_studies_description: string;
  // 참여 기업 연계 페이지 "기업 참여 방식" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  participation_types_description: string;
  // 교육 관리 페이지 "교육 성과 지표" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  management_metrics_description: string;
  // 교육 관리 페이지 "학습자 관리" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  learner_management_description: string;
  // 교육 관리 페이지 "학습부진자 지도 계획" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  support_plans_description: string;
  // 교육 관리 페이지 "개월차별 관리" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  management_months_description: string;
  // "개월차별 관리" 타임라인이 기준으로 삼는 전체 교육 기간(개월). 예: 6개월 과정이 가장 길면 6.
  // 각 카드의 막대 너비는 이 전체 기간 대비 (month_end - month_start + 1)의 비율로 정해진다.
  management_months_total_months: number;
  // 교육 관리 페이지 "교육 품질 관리" 섹션 제목 바로 아래에 표시되는 한 줄 설명
  quality_management_description: string;
  // 교육 관리 페이지 "오프라인 교육장" 섹션 전체 설명 (사진 슬라이드 위에 표시)
  training_facility_description: string;
  // "오프라인 교육장" 섹션에 슬라이드로 표시되는 사진 목록
  training_facility_photos: TrainingFacilityPhoto[];
  // "오프라인 교육장" 섹션 하단에 표시되는 특징 카드 목록 (관리자가 자유롭게 추가/삭제 가능)
  training_facility_highlights: TrainingFacilityHighlight[];
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
export type PartnersFieldLabels = Record<PartnersFormFieldKey, string>;
export type PartnersFieldVisibility = Record<PartnersFormFieldKey, boolean>;

// 참여 신청 팝업 폼에 관리자가 자유롭게 추가하는 항목. 한 줄 텍스트 입력 하나로 고정되어 있고,
// 값은 구글 시트에 기존 10개 항목 뒤에 이 목록 순서 그대로 추가 열로 기록된다. (그래서 항목을
// 추가/삭제/순서 변경하면 구글 시트의 머리글 행도 같은 순서로 맞춰줘야 한다 — 관리자 화면과
// README에 안내되어 있다)
export type PartnersCustomField = {
  id: string;
  label: string;
  required: boolean;
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

