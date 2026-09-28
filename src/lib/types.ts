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

// "운영 교육 과정" 페이지 맨 위에 나열되는 전체 교육 과정 개요(예: AX 챔피언 4주, AX 해커톤 4주,
// 커리어 교육 4주, 부트캠프 6개월). is_main으로 표시한 과정 하나가 더 크게/강조되어 보여지고,
// 그 아래 이어지는 "교육 영역"·"커리큘럼 구성" 등 상세 섹션은 모두 그 과정(부트캠프)을 기준으로
// 한다는 뜻이다. 관리자 페이지에서 자유롭게 추가/삭제/순서 변경할 수 있다.
export type EducationProgram = {
  id: string;
  title: string; // "AX 챔피언", "부트캠프" 등
  duration_label: string; // "4주 과정", "6개월 과정" 등 자유 입력
  description: string;
  is_main: boolean; // 이 항목만 크게 강조해서 보여준다 (하나만 true로 두는 것을 권장)
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
  // 프로젝트 한 줄 요약 (과거에는 카드 하단에 표시했으나, 지금은 카드 하단에 교육 영역의 세부
  // 토픽 태그를 대신 보여준다. 컬럼은 남겨두되 공개 화면에서는 더 이상 쓰지 않는다.)
  project: string | null;
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

// 개월차별 관리 카드에서, 칸(열)을 클릭했을 때 좌우로 넘겨보는 사진 한 장
export type ManagementMonthPhoto = {
  image_url: string | null;
  caption: string;
};

// 간트 차트의 특정 칸(열) 하나에 등록된 사진 묶음. column은 management_months_columns 배열의
// 몇 번째 칸인지를 가리키는 1부터 시작하는 번호다(month_start/month_end와 같은 체계). 구간이
// 여러 칸에 걸쳐 있으면(예: "프로젝트"가 1~6개월차) 칸마다 서로 다른 사진을 등록할 수 있다.
export type ManagementMonthCellPhotos = {
  column: number;
  photos: ManagementMonthPhoto[];
};

// 교육 관리 페이지 "개월차별 관리" 카드. 학습부진자 지도 계획(SupportPlanTrack)과는 별개의 새 섹션이다.
// 공개 화면에서는 카드가 아니라 간트 차트 표 형태로 표시된다. month_start/month_end는 실제
// "개월 수"가 아니라, SiteSettings.management_months_columns 배열의 몇 번째 칸인지를 가리키는
// 1부터 시작하는 번호다 (예: management_months_columns가 ["1개월차",...,"6개월차","수료 이후"]이고
// month_start=1, month_end=2 면 "1개월차"~"2개월차" 두 칸이 색칠된다. 관리자 화면에서는 이 번호
// 대신 실제 칸 이름을 고르는 드롭다운으로 보여준다).
export type ManagementMonth = {
  id: string;
  month_start: number;
  month_end: number;
  title: string;
  description: string;
  tags: string[];
  cell_photos: ManagementMonthCellPhotos[]; // 칸(열)별로 등록된 사진. 칸을 클릭하면 그 칸의 사진만 팝업으로 보인다.
  color: string | null; // 간트 차트에서 이 구간 막대의 색상 (hex). 비어있으면 자동으로 배정된 색을 쓴다.
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
  group?: string | null; // 예전 버전에서 쓰던 "구분" 값(더 이상 화면에 표시하지 않음, 과거 데이터 호환용)
  title: string;
  description: string;
  icon?: string | null; // 카드 맨 위에 보여줄 아이콘 (icon-map.tsx의 이름 중 하나)
  order: number;
  is_published: boolean; // 개별 카드를 숨길지 여부 (숨겨도 삭제되지는 않는다)
};

// 교육 관리 페이지 "교육 품질 관리" 섹션 맨 위에 보여주는 프로세스 흐름 (예: 01 경청 확인 →
// 02 데이터 분석 → 03 피드백 반영 → 04 다음 교육으로). 화살표로 이어지는 카드 형태로 표시되며,
// 카드마다 아이콘 + 번호 + 제목 + 짧은 설명이 들어간다.
export type QualityProcessStep = {
  id: string;
  order: number;
  title: string;
  description?: string;
  icon?: string | null;
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
  // "개월차별 관리" 간트 차트 표의 칸(열) 이름 목록. 순서대로 왼쪽부터 표시되며, 관리자가 이름을
  // 자유롭게 바꾸거나 뒤에 새 칸을 추가할 수 있다 (예: 6개월 과정 뒤에 "수료 이후" 칸을 추가).
  // 각 ManagementMonth 항목의 month_start/month_end는 이 배열의 몇 번째 칸인지를 가리킨다.
  management_months_columns: string[];
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

export type CustomSectionPhoto = {
  image_url: string | null;
};

export type CustomSectionItem = {
  heading: string;
  body: string;
  icon?: string | null; // 카드 맨 위에 보여줄 아이콘 (선택 — icon-map.tsx의 이름 중 하나)
  image_url?: string | null; // 예전 버전 호환용 필드 (더 이상 새로 저장하지 않음 — 아래 photos 사용)
  photos?: CustomSectionPhoto[]; // 카드에 첨부하는 사진 목록 (선택, 여러 장 가능 — 좌우로 스와이프해서 넘겨볼 수 있고 마지막 사진 다음 다시 첫 사진으로 자연스럽게 이어진다)
  photo_display?: "inline" | "popup"; // 사진을 카드 안에 바로 보여줄지("inline", 기본값), 탭했을 때만 팝업으로 보여줄지("popup")
};

// 관리자가 "운영 교육 과정 / 교육 관리 / 참여 기업 연계" 페이지 안에 자유롭게 추가하는 섹션.
// custom_pages(완전히 새로운 탭 = 별도 주소의 새 페이지)와 다르게, 이건 이미 있는 공개 페이지의
// 다른 섹션들 사이 어디든 순서를 자유롭게 끼워 넣을 수 있다 — 관리자 대시보드에서 기존 메뉴들과
// 똑같이 위/아래 화살표로 위치를 정한다.
export type CustomSection = {
  id: string;
  page_key: "courses" | "education-management" | "partners";
  title: string;
  description: string;
  items: CustomSectionItem[];
  order: number;
  is_published: boolean;
  created_at: string;
};

