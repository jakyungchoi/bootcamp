-- 원티드랩 부트캠프 교육사업 웹페이지 — 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. (한 번만 실행하면 됩니다)
-- 이 파일은 관리자 페이지(2단계) 개발 전까지는 프론트엔드가 src/lib/content.ts 의 목업 데이터를 사용하므로
-- 지금 당장 실행하지 않아도 사이트는 정상 동작합니다. 실제 데이터 연동을 시작할 때 실행하세요.

create extension if not exists "pgcrypto";

-- 공통: 콘텐츠 공개/비공개, 정렬 순서를 갖는 테이블들
create table if not exists course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "order" int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references course_categories(id) on delete set null,
  title text not null,
  subtitle text,
  description text,
  highlights jsonb not null default '[]', -- string[]
  project text,
  image_url text,
  detail_page_enabled boolean not null default false,
  "order" int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists culture_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  highlights jsonb not null default '[]',
  image_url text,
  "order" int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_participation_types (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  "order" int not null default 0,
  is_published boolean not null default true
);

create table if not exists company_flow_steps (
  id uuid primary key default gen_random_uuid(),
  "order" int not null,
  title text not null
);

create table if not exists company_case_studies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  title text not null,
  description text,
  image_url text,
  "order" int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 페이지의 고정 섹션(예: 홈 히어로, 학습자 관리 카드, 학습부진자 지도 계획)처럼
-- 별도 목록형 테이블을 만들 필요 없는 콘텐츠를 위한 범용 테이블.
-- page_key + section_key 조합으로 화면의 특정 블록을 가리킨다.
create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_key text not null, -- 'home' | 'education-management' | ...
  section_key text not null, -- 'hero' | 'learner-management' | ...
  title text,
  description text,
  body jsonb, -- 자유 형식 (목록, 표 등)
  image_url text,
  "order" int not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

-- 관리자 계정. 실제 로그인은 Supabase Auth(auth.users)를 사용하고,
-- 이 테이블은 auth 사용자에 역할(role)을 매핑하는 프로필 테이블이다.
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'ADMIN' check (role in ('SUPER_ADMIN', 'ADMIN', 'EDITOR')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────
-- 공개 페이지: 비로그인 사용자도 "공개(is_published=true)" 콘텐츠는 읽을 수 있어야 한다.
-- 관리자 페이지: admin_users 에 등록된 로그인 사용자만 쓰기가 가능하다.

alter table course_categories enable row level security;
alter table courses enable row level security;
alter table culture_programs enable row level security;
alter table company_participation_types enable row level security;
alter table company_flow_steps enable row level security;
alter table company_case_studies enable row level security;
alter table content_blocks enable row level security;
alter table admin_users enable row level security;

-- 공개 읽기 정책 (공개 테이블 전체에 동일하게 적용)
-- company_flow_steps 는 is_published 컬럼이 없으므로 이 배열에서 제외하고, 바로 아래에서 따로 처리한다.
do $$
declare
  t text;
begin
  foreach t in array array[
    'course_categories', 'courses', 'culture_programs',
    'company_participation_types', 'company_case_studies', 'content_blocks'
  ]
  loop
    execute format('drop policy if exists "public read published" on %I;', t);
    execute format(
      'create policy "public read published" on %I for select using (is_published = true);',
      t
    );
  end loop;
end $$;

-- company_flow_steps 는 공개/비공개 컬럼이 없으므로 전체 공개
drop policy if exists "public read published" on company_flow_steps;
drop policy if exists "public read all" on company_flow_steps;
create policy "public read all" on company_flow_steps for select using (true);

-- 관리자 쓰기 정책 (admin_users 에 등록된 로그인 사용자만 insert/update/delete 가능)
do $$
declare
  t text;
begin
  foreach t in array array[
    'course_categories', 'courses', 'culture_programs',
    'company_participation_types', 'company_flow_steps', 'company_case_studies', 'content_blocks'
  ]
  loop
    execute format('drop policy if exists "admin write" on %I;', t);
    execute format(
      'create policy "admin write" on %I for all using (auth.uid() in (select id from admin_users)) with check (auth.uid() in (select id from admin_users));',
      t
    );
  end loop;
end $$;

drop policy if exists "admin can read own row" on admin_users;
create policy "admin can read own row" on admin_users for select using (auth.uid() = id);

-- ── 초기 시드 데이터 (선택) ───────────────────────────────────────────
-- src/lib/content.ts 의 목업 데이터와 동일한 카테고리만 우선 넣어둔다.
insert into course_categories (name, slug, "order") values
  ('AI / AX', 'ai-ax', 1),
  ('개발', 'dev', 2),
  ('Career', 'career', 3)
on conflict (slug) do nothing;

-- company_flow_steps 에는 제목에 고유 제약이 없어서 "on conflict do nothing"이 실제로는 아무 효과가
-- 없었다 (부딪힐 대상이 없으니 매번 그냥 8개를 새로 추가함) — schema.sql을 다시 실행할 때마다 "이런 협업이
-- 가능해요" 항목이 계속 중복 생성된 원인이 바로 이것이다. 이미 행이 하나라도 있으면 건너뛰도록 고쳤다.
insert into company_flow_steps ("order", title)
select * from (values
  (1, '기업의 문제/수요'),
  (2, '교육 과정 설계'),
  (3, '프로젝트 주제 선정'),
  (4, '데이터·현업 지식 제공'),
  (5, '교육생 프로젝트'),
  (6, '기업 멘토링'),
  (7, '결과물 공유'),
  (8, '현장실습·채용·커리어 연계')
) as v("order", title)
where not exists (select 1 from company_flow_steps);

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 — 홈/교육 관리 페이지의 나머지 콘텐츠 + 사이트 전역 설정
-- 이 아래 블록은 기존 스키마를 실행한 뒤에 이어서 실행해도 안전합니다 (모두 if not exists).
-- ══════════════════════════════════════════════════════════════════

-- 교육 영역 카드에 표시되는 세부 토픽 (예: AI/AX -> AI Agent, 생성형 AI, ...)
alter table course_categories add column if not exists topics jsonb not null default '[]';

-- 운영 교육 과정 페이지 "02. 커리큘럼 구성" 단계
create table if not exists curriculum_flow_steps (
  id uuid primary key default gen_random_uuid(),
  "order" int not null,
  title text not null
);

-- 교육 관리 페이지 "01. 학습자 관리" 카드
create table if not exists learner_management_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  "order" int not null default 0,
  is_published boolean not null default true
);

-- 교육 관리 페이지 "02. 학습부진자 지도 계획" 표
create table if not exists support_plan_tracks (
  id uuid primary key default gen_random_uuid(),
  track_name text not null,
  items jsonb not null default '[]', -- string[]
  "order" int not null default 0
);

-- 교육 관리 페이지 "03. 교육 품질 관리" (만족도 관리 / 강사 관리)
create table if not exists quality_management_items (
  id uuid primary key default gen_random_uuid(),
  "group" text not null check ("group" in ('satisfaction', 'instructor')),
  title text not null,
  description text,
  "order" int not null default 0
);

-- 교육 관리 페이지 "협업 환경"에 표시되는 도구 목록
create table if not exists collaboration_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "order" int not null default 0
);

-- 사이트 전역 설정 (로고, 사이트명, 홈 히어로, 홈 4개 영역 카드). 항상 딱 한 행만 존재한다.
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default '원티드랩 교육사업',
  logo_url text,
  footer_description text not null default
    '교육을 넘어, 실제 커리어로 연결되는 교육. 대학/기관, 참여 기업, 교육 관계자를 위한 원티드랩 교육사업 소개 페이지입니다.',
  home_hero_eyebrow text not null default 'Wanted Lab Education',
  home_hero_title text not null default '교육을 넘어, 실제 커리어로 연결되는 교육',
  home_hero_subtitle text not null default
    '직무 역량을 쌓고, 프로젝트를 경험하고, 현업과 연결되며 다음 커리어를 준비합니다.',
  home_hero_image_url text,
  -- 홈 화면 4개 핵심 영역 카드 (헤더 메뉴 이름도 여기서 함께 가져다 씁니다)
  -- [{ "key": "courses", "href": "/courses", "title": "...", "eyebrow": "...", "description": "..." }, ...]
  home_highlights jsonb not null default '[
    {"key":"courses","href":"/courses","title":"운영 교육 과정","eyebrow":"What we teach","description":"다양한 직무와 트랙의 실무 중심 교육을 제공합니다."},
    {"key":"management","href":"/education-management","title":"교육 관리","eyebrow":"How we operate","description":"체계적인 교육 관리와 품질 관리 시스템으로 안정적인 교육을 운영합니다."},
    {"key":"culture","href":"/culture","title":"교육 문화","eyebrow":"What makes us different","description":"원티드랩만의 교육 경험과 성장 문화를 제공합니다."},
    {"key":"partners","href":"/partners","title":"참여 기업 연계","eyebrow":"How we connect to industry","description":"기업의 현업 경험을 교육 과정에 연결합니다."}
  ]',
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- RLS: 새 테이블들도 공개 읽기 + 관리자만 쓰기
alter table curriculum_flow_steps enable row level security;
alter table learner_management_items enable row level security;
alter table support_plan_tracks enable row level security;
alter table quality_management_items enable row level security;
alter table collaboration_tools enable row level security;
alter table site_settings enable row level security;

-- is_published 컬럼이 있는 테이블: 공개된 것만 읽기 허용
do $$
declare
  t text;
begin
  foreach t in array array['learner_management_items']
  loop
    execute format('drop policy if exists "public read published" on %I;', t);
    execute format(
      'create policy "public read published" on %I for select using (is_published = true);',
      t
    );
  end loop;
end $$;

-- is_published 컬럼이 없는 테이블: 전체 공개
do $$
declare
  t text;
begin
  foreach t in array array[
    'curriculum_flow_steps', 'support_plan_tracks', 'quality_management_items',
    'collaboration_tools', 'site_settings'
  ]
  loop
    execute format('drop policy if exists "public read all" on %I;', t);
    execute format('create policy "public read all" on %I for select using (true);', t);
  end loop;
end $$;

-- 관리자만 쓰기 (모든 새 테이블 공통)
do $$
declare
  t text;
begin
  foreach t in array array[
    'curriculum_flow_steps', 'learner_management_items', 'support_plan_tracks',
    'quality_management_items', 'collaboration_tools', 'site_settings'
  ]
  loop
    execute format('drop policy if exists "admin write" on %I;', t);
    execute format(
      'create policy "admin write" on %I for all using (auth.uid() in (select id from admin_users)) with check (auth.uid() in (select id from admin_users));',
      t
    );
  end loop;
end $$;

-- 이미지 업로드용 스토리지 버킷 (로고, 과정/카드 이미지 등을 여기에 저장)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');

drop policy if exists "admin write media" on storage.objects;
create policy "admin write media" on storage.objects for all
  using (bucket_id = 'media' and auth.uid() in (select id from admin_users))
  with check (bucket_id = 'media' and auth.uid() in (select id from admin_users));

-- 카테고리별 토픽 시드 (기존 목업 데이터와 동일)
update course_categories set topics = '["AI Agent", "생성형 AI", "AI 활용", "업무 자동화", "AX"]'
  where slug = 'ai-ax' and topics = '[]';
update course_categories set topics = '["Backend", "Frontend", "Game Development", "C++", "Unreal Engine"]'
  where slug = 'dev' and topics = '[]';
update course_categories set topics = '["취업 역량", "프로젝트", "포트폴리오", "면접", "커리어 연계"]'
  where slug = 'career' and topics = '[]';

-- 아래 시드들은 테이블이 비어 있을 때만 한 번 들어가도록 되어 있어서, 이 파일을 여러 번
-- 실행해도(예: 이후 스키마 업데이트를 다시 붙여넣어도) 데이터가 중복 생성되지 않습니다.

insert into curriculum_flow_steps ("order", title)
select * from (values
  (1, '기초 역량'), (2, '직무 교육'), (3, '실습'), (4, '프로젝트'), (5, '현업 피드백'), (6, '취업 / 커리어 연계')
) as v("order", title)
where not exists (select 1 from curriculum_flow_steps);

insert into learner_management_items (title, description, icon, "order")
select * from (values
  ('출결 관리', '출결 현황을 상시 확인하고 관리합니다.', 'CalendarCheck', 1),
  ('학습 참여 관리', '학습 참여도를 추적하고 독려합니다.', 'Users', 2),
  ('학습부진자 관리', '학습에 어려움을 겪는 교육생을 조기에 발견하고 지원합니다.', 'LifeBuoy', 3),
  ('학습 현황 확인', '교육생별 학습 현황을 대시보드로 확인합니다.', 'LineChart', 4)
) as v(title, description, icon, "order")
where not exists (select 1 from learner_management_items);

insert into support_plan_tracks (track_name, items, "order")
select v.track_name, v.items::jsonb, v."order" from (values
  ('공통', '["출결 관리"]', 1),
  ('1과정', '["학습부진자 지원"]', 2),
  ('2과정', '["인프런 강의 제공", "현장 강의 녹화본 제공", "특강 제공"]', 3),
  ('3과정', '["학습부진자 지원"]', 4)
) as v(track_name, items, "order")
where not exists (select 1 from support_plan_tracks);

insert into quality_management_items ("group", title, description, "order")
select * from (values
  ('만족도 관리', '교육 만족도', '과정 전반에 대한 만족도를 조사합니다.', 1),
  ('만족도 관리', '강사 만족도', '강사별 강의 만족도를 조사합니다.', 2),
  ('만족도 관리', '프로젝트 만족도', '프로젝트 진행 과정의 만족도를 조사합니다.', 3),
  ('만족도 관리', '과정별 만족도', '과정 단위로 만족도를 비교 관리합니다.', 4),
  ('강사 관리', '강사 Pool', '검증된 강사 풀을 관리합니다.', 5),
  ('강사 관리', '강사 평가', '정기적인 강사 평가를 진행합니다.', 6),
  ('강사 관리', '강의 품질 관리', '강의 콘텐츠와 진행 품질을 관리합니다.', 7),
  ('강사 관리', '피드백', '교육생 피드백을 강사에게 전달하고 반영합니다.', 8)
) as v("group", title, description, "order")
where not exists (select 1 from quality_management_items);

insert into collaboration_tools (name, "order")
select * from (values
  ('Notion', 1), ('Slack', 2), ('Google Workspace', 3), ('GitHub', 4), ('LMS', 5)
) as v(name, "order")
where not exists (select 1 from collaboration_tools);

-- ══════════════════════════════════════════════════════════════════
-- 교육 품질 관리 "구분"을 관리자 페이지에서 자유롭게 추가/삭제할 수 있도록 변경
-- (기존에는 'satisfaction' / 'instructor' 두 값만 허용하는 제약이 있었다)
-- ══════════════════════════════════════════════════════════════════
alter table quality_management_items drop constraint if exists quality_management_items_group_check;

-- 이미 예전 스키마로 시드된 적이 있다면 영문 값을 한글 표시용 이름으로 바꿔준다.
update quality_management_items set "group" = '만족도 관리' where "group" = 'satisfaction';
update quality_management_items set "group" = '강사 관리' where "group" = 'instructor';

-- 홈 화면 히어로 상단의 영문 소제목 (예: "WANTED LAB EDUCATION")도 관리자 페이지에서 수정 가능하도록 추가
alter table site_settings add column if not exists home_hero_eyebrow text not null default 'Wanted Lab Education';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 2
-- 1) 4개 주요 페이지(운영 교육 과정 / 교육 관리 / 교육 문화 / 참여 기업 연계) 맨 위
--    영문 소제목 · 제목 · 설명 문구를 관리자 페이지에서 수정할 수 있도록 함
-- 2) 관리자 대시보드 탭(메뉴) 이름/순서/표시 여부를 관리자 페이지에서 바꿀 수 있도록 함
-- 3) 관리자가 완전히 새로운 탭(=페이지)을 직접 추가할 수 있도록 "커스텀 페이지" 기능 추가
-- ══════════════════════════════════════════════════════════════════

-- 1) 페이지 상단 문구
create table if not exists page_headers (
  page_key text primary key, -- 'courses' | 'education-management' | 'culture' | 'partners'
  eyebrow text not null default '',
  title text not null default '',
  description text not null default ''
);

alter table page_headers enable row level security;

drop policy if exists "public read all" on page_headers;
create policy "public read all" on page_headers for select using (true);

drop policy if exists "admin write" on page_headers;
create policy "admin write" on page_headers for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

insert into page_headers (page_key, eyebrow, title, description)
select * from (values
  ('courses', 'What we teach', '운영 교육 과정',
    '원티드랩이 어떤 교육을 제공할 수 있는지 교육 영역과 교육 방식을 통해 보여줍니다.'),
  ('education-management', 'How we operate', '교육 관리',
    '교육생 관리, 학습부진자 관리, 강사 관리, 만족도 관리 등 교육을 어떻게 운영하고 품질을 관리하는지 보여줍니다.'),
  ('culture', 'What makes us different', '교육 문화',
    '원티드랩에서 교육을 받으면 무엇이 다른가를 보여주는 페이지입니다. 단순 교육 콘텐츠가 아니라 교육생의 성장과 커뮤니티 경험을 전달합니다.'),
  ('partners', 'How we connect to industry', '참여 기업 연계',
    '기업이 단순히 교육을 후원하는 것이 아니라, 교육 과정에 직접 참여할 수 있다는 점을 보여줍니다.')
) as v(page_key, eyebrow, title, description)
where not exists (select 1 from page_headers where page_headers.page_key = v.page_key);

-- 2) 관리자 대시보드 탭(기존 12개 고정 메뉴) 이름/순서/표시 여부 재정의
--    각 컬럼은 관리자가 실제로 바꾼 값만 채워지고, 비어있으면(=이 테이블에 행이 없으면)
--    코드에 정해진 기본값(라벨/순서)을 그대로 사용한다.
create table if not exists admin_menu_overrides (
  key text primary key,
  label text,
  "order" int,
  is_visible boolean
);

alter table admin_menu_overrides enable row level security;

drop policy if exists "admin manage" on admin_menu_overrides;
create policy "admin manage" on admin_menu_overrides for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- 3) 관리자가 자유롭게 추가/삭제하는 커스텀 페이지 (=완전히 새로운 탭)
--    관리자 대시보드에 탭으로 표시되고, /pages/[slug] 주소로 공개된다.
create table if not exists custom_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  eyebrow text not null default '',
  description text not null default '',
  sections jsonb not null default '[]', -- [{ "heading": "...", "body": "..." }, ...]
  "order" int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table custom_pages enable row level security;

drop policy if exists "public read published" on custom_pages;
create policy "public read published" on custom_pages for select using (is_published = true);

drop policy if exists "admin manage" on custom_pages;
create policy "admin manage" on custom_pages for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 3
-- 헤더 상단 메뉴를 홈 화면 4개 핵심 영역 카드(home_highlights)와 분리한다.
-- 지금까지는 하나의 값을 헤더 메뉴/홈 카드가 함께 썼는데, 항목 개수나 구성이 서로 달라도
-- 되도록 완전히 별개의 값으로 만든다. (기존 home_highlights 는 그대로 홈 화면 카드용으로 남는다.)
-- [{ "key": "courses", "href": "/courses", "title": "..." }, ...]
alter table site_settings add column if not exists nav_items jsonb not null default '[
    {"key":"courses","href":"/courses","title":"운영 교육 과정"},
    {"key":"management","href":"/education-management","title":"교육 관리"},
    {"key":"culture","href":"/culture","title":"교육 문화"},
    {"key":"partners","href":"/partners","title":"참여 기업 연계"}
  ]';

-- 기존에 이미 site_settings 행이 있던 사이트는, 위 기본값 대신 지금까지 쓰던
-- home_highlights 의 key/href/title 을 그대로 헤더 메뉴 초기값으로 옮겨준다.
-- (한 번만 옮기면 되므로, nav_items 를 아직 한 번도 따로 저장한 적 없는 경우에만 적용)
update site_settings
set nav_items = (
  select coalesce(jsonb_agg(jsonb_build_object('key', h->>'key', 'href', h->>'href', 'title', h->>'title')), '[]'::jsonb)
  from jsonb_array_elements(home_highlights) as h
)
where id = 1
  and home_highlights is not null
  and jsonb_array_length(home_highlights) > 0
  and nav_items = '[
    {"key":"courses","href":"/courses","title":"운영 교육 과정"},
    {"key":"management","href":"/education-management","title":"교육 관리"},
    {"key":"culture","href":"/culture","title":"교육 문화"},
    {"key":"partners","href":"/partners","title":"참여 기업 연계"}
  ]'::jsonb;

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 4
-- 1) 운영 교육 과정 — 과정 기간 분류(단기/중장기) + 과정별 프로젝트 상세(팝업, 좌우 캐러셀)
-- 2) 교육 관리 — 상단 숫자 지표 카드 + 개월차별 관리(사진 포함, 좌우 캐러셀)
-- 3) 참여 기업 연계 — 기업 참여 방식에 붙일 신청 폼(구글 폼 등) 링크

create table if not exists course_duration_types (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  slug text not null default '',
  "order" int not null default 0,
  is_published boolean not null default true
);
alter table course_duration_types enable row level security;
drop policy if exists "public read published" on course_duration_types;
create policy "public read published" on course_duration_types for select using (is_published = true);
drop policy if exists "admin write" on course_duration_types;
create policy "admin write" on course_duration_types for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

insert into course_duration_types (name, slug, "order", is_published)
select v.name, v.slug, v.ord, true
from (values
  ('단기 과정', 'short-term', 1),
  ('중장기 과정', 'long-term', 2)
) as v(name, slug, ord)
where not exists (select 1 from course_duration_types where course_duration_types.slug = v.slug);

-- courses: 과정 기간 분류(선택 사항) + 프로젝트 상세 목록(팝업용, 좌우로 넘겨봄)
-- [{ "title": "...", "description": "...", "image_url": "..." }, ...]
alter table courses add column if not exists duration_type_id uuid references course_duration_types(id) on delete set null;
alter table courses add column if not exists projects jsonb not null default '[]';

-- 교육 관리 페이지 상단 "숫자로 검증된 실제 결과" 카드 행 (예: "99건" / "1·2기 누적 산출")
create table if not exists management_metrics (
  id uuid primary key default gen_random_uuid(),
  value text not null default '',
  label text not null default '',
  "order" int not null default 0,
  is_published boolean not null default true
);
alter table management_metrics enable row level security;
drop policy if exists "public read published" on management_metrics;
create policy "public read published" on management_metrics for select using (is_published = true);
drop policy if exists "admin write" on management_metrics;
create policy "admin write" on management_metrics for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- 위 숫자 카드 아래의 어두운 강조 타일. type='stat'(큰 숫자+설명) 또는 type='list'(제목+목록, 예: Reference)
create table if not exists management_highlights (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'stat',
  value text not null default '',
  description text not null default '',
  title text not null default '',
  items jsonb not null default '[]',
  "order" int not null default 0,
  is_published boolean not null default true
);
alter table management_highlights enable row level security;
drop policy if exists "public read published" on management_highlights;
create policy "public read published" on management_highlights for select using (is_published = true);
drop policy if exists "admin write" on management_highlights;
create policy "admin write" on management_highlights for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- 교육 관리 페이지 "개월차별 관리" 카드. 학습부진자 지도 계획(support_plan_tracks)과는 별개의 새 섹션.
-- photos: [{ "image_url": "...", "caption": "..." }, ...] — 클릭 시 좌우로 넘겨보는 팝업으로 표시
create table if not exists management_months (
  id uuid primary key default gen_random_uuid(),
  month_label text not null default '',
  title text not null default '',
  description text not null default '',
  tags jsonb not null default '[]',
  photos jsonb not null default '[]',
  "order" int not null default 0,
  is_published boolean not null default true
);
alter table management_months enable row level security;
drop policy if exists "public read published" on management_months;
create policy "public read published" on management_months for select using (is_published = true);
drop policy if exists "admin write" on management_months;
create policy "admin write" on management_months for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- 참여 기업 연계 페이지 "기업 참여 방식"에 붙일 신청 폼(구글 폼 등) 링크
alter table site_settings add column if not exists partners_form_url text not null default '';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 5
-- admin_menu_overrides 는 지금까지 관리자만 읽을 수 있었는데(공개 정책이 없었음),
-- 관리자 대시보드에서 메뉴를 "숨기기" 하면 공개 페이지에서도 해당 섹션 전체가 사라지고
-- 남은 섹션 번호가 자동으로 다시 매겨지도록 하려면 공개 페이지에서도 이 값을 읽을 수 있어야 한다.
-- (숨김 여부만 공개되며 민감한 정보는 아니다)
drop policy if exists "public read all" on admin_menu_overrides;
create policy "public read all" on admin_menu_overrides for select using (true);

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 6
-- 교육 문화 프로그램 카드의 사진을 한 장이 아니라 여러 장(좌우 슬라이드) 등록할 수 있도록 확장.
-- 기존 image_url 컬럼은 그대로 두고(과거 데이터 보존), 새 photos 배열 컬럼을 추가한 뒤
-- 기존에 등록되어 있던 대표 이미지가 있으면 그 값을 photos 배열의 첫 항목으로 한 번만 옮겨준다.
alter table culture_programs add column if not exists photos jsonb not null default '[]';

update culture_programs
set photos = jsonb_build_array(jsonb_build_object('image_url', image_url))
where image_url is not null
  and photos = '[]'::jsonb;

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 7
-- "이런 협업이 가능해요"에 같은 항목이 중복으로 쌓여 있던 문제를 정리한다.
-- 원인: 위 시드 데이터가 "제목이 같으면 건너뛰기"가 걸려 있지 않아서, schema.sql을 다시 실행할 때마다
-- 8개 항목이 매번 새로 추가되고 있었다 (그래서 관리자 페이지에서 지워도 다음에 schema.sql을 다시
-- 실행하면 똑같이 다시 생겨난 것처럼 보였다). 이제 시드 자체는 위에서 고쳤고, 아래는 이미 쌓여있는
-- 중복 행을 한 번에 정리하는 부분이다 (제목이 같은 행 중 하나만 남기고 나머지를 지운다).
-- 중복이 없는 상태에서 다시 실행해도 아무 일도 일어나지 않아 안전하다.
delete from company_flow_steps a
using company_flow_steps b
where a.title = b.title
  and a.ctid > b.ctid;

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 8
-- 참여 기업 연계 페이지에 "참여 신청하기" 팝업 폼을 추가한다. 예전에는 partners_form_url에
-- 구글 폼 등 외부 링크를 넣으면 새 탭으로 이동하는 방식이었는데, 이제는 사이트 안에서 팝업으로
-- 폼을 받아 서버가 구글 시트에 직접 기록하는 방식으로 바뀌었다 (구글 서비스 계정 + Sheets API,
-- 자세한 내용은 README 참고). partners_form_url 컬럼 자체는 과거 데이터 보존을 위해 지우지
-- 않지만 더 이상 사용하지 않는다.
alter table site_settings add column if not exists partners_meeting_options jsonb not null default
  '["30분 온라인 미팅", "원티드랩으로 방문", "기업으로 방문"]';

alter table site_settings add column if not exists partners_privacy_notice text not null default
  '수집 항목: 기업명, 담당자명, 부서, 직급/직책, 이메일, 연락처, 참여 희망 방식, 만남 방식, 문의/요청 내용, 남기실 말씀
수집 목적: 참여 기업 연계 신청 접수 및 담당자 회신
보유 및 이용 기간: 신청 접수일로부터 1년 (관련 법령에 따라 보존이 필요한 경우 해당 기간까지)
귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 참여 신청 접수가 제한될 수 있습니다.';

alter table site_settings add column if not exists partners_submit_notice text not null default
  '제출하시면 담당자가 2영업일 이내에 회신드립니다.';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 9
-- 참여 신청 팝업 폼의 각 입력 항목(기업명, 담당자명, 부서, 직급/직책, 이메일, 연락처,
-- 참여 희망 방식, 만남 방식, 문의/요청 내용, 남기실 말씀)을 필수로 받을지 선택 입력으로
-- 둘지 관리자 대시보드(사이트 전역 설정)에서 켜고 끌 수 있도록 한다.
alter table site_settings add column if not exists partners_required_fields jsonb not null default
  '{"companyName": true, "contactName": true, "department": false, "position": false, "email": true, "phone": true, "participationTypes": true, "meetingMethod": true, "request": true, "message": false}';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 10
-- 참여 기업 연계 페이지 "이런 협업이 가능해요" 섹션 제목 바로 아래에 표시되는 한 줄 설명이
-- 코드에 고정된 문구라 관리자 화면에서 수정할 방법이 없었다. site_settings에 컬럼을 추가하고,
-- 관리자 대시보드의 해당 메뉴(company-flow) 화면에서 바로 수정할 수 있도록 한다.
alter table site_settings add column if not exists company_flow_description text not null default
  '기업과 함께 진행할 수 있는 활동입니다.';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 11
-- 위 확장 10과 같은 이유로, "협업 사례" / "기업 참여 방식" 섹션도 제목 바로 아래 한 줄 설명을
-- 관리자 화면에서 수정할 수 있도록 컬럼을 추가한다. 또한 참여 신청 팝업 폼의 각 입력 항목에
-- 실제로 표시되는 이름(라벨) 문구도 관리자 화면에서 자유롭게 바꿀 수 있도록 컬럼을 추가한다
-- (예: "남기실 말씀 (선택 작성)" 같은 고정 문구를 "남기실 말씀"으로 바꾸는 등).
alter table site_settings add column if not exists case_studies_description text not null default
  '원티드랩 부트캠프와 함께한 기업들의 협업 사례입니다.';

alter table site_settings add column if not exists participation_types_description text not null default
  '다양한 방식으로 부트캠프 교육에 참여할 수 있습니다.';

alter table site_settings add column if not exists partners_field_labels jsonb not null default
  '{"companyName": "기업명", "contactName": "담당자명", "department": "부서", "position": "직급 / 직책", "email": "이메일", "phone": "연락처", "participationTypes": "참여 희망 방식", "meetingMethod": "만남 방식", "request": "문의 / 요청 내용", "message": "남기실 말씀"}';

-- ══════════════════════════════════════════════════════════════════
-- 관리자 페이지 확장 12
-- 참여 신청 팝업 폼의 항목을 관리자가 직접 추가/삭제할 수 있도록 한다.
-- - partners_field_visibility: 기본 제공 10개 항목을 폼에서 완전히 숨길지(=사실상 삭제) 여부.
-- - partners_custom_fields: 관리자가 자유롭게 추가하는 한 줄 입력 항목 목록. 값은 구글 시트에
--   기존 10개 항목 뒤에 이 목록 순서 그대로 추가 열로 기록되므로, 항목을 추가/삭제/순서
--   변경하면 구글 시트의 머리글 행도 같은 순서로 맞춰줘야 한다 (README 참고).
alter table site_settings add column if not exists partners_field_visibility jsonb not null default
  '{"companyName": true, "contactName": true, "department": true, "position": true, "email": true, "phone": true, "participationTypes": true, "meetingMethod": true, "request": true, "message": true}';

alter table site_settings add column if not exists partners_custom_fields jsonb not null default '[]';
