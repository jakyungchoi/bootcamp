# 원티드랩 부트캠프 교육사업 웹페이지

Home + 4개 핵심 페이지(운영 교육 과정 / 교육 관리 / 교육 문화 / 참여 기업 연계) + **관리자
페이지(`/admin`)** 를 Next.js + Tailwind CSS + Supabase로 구현했습니다. 공개 페이지의 거의
모든 텍스트/이미지/카드 항목을 관리자 페이지에서 코드 수정 없이 바로 바꿀 수 있습니다.

## 지금 상태

- Supabase를 아직 연결하지 않아도 `src/lib/content.ts`의 예시 데이터로 5개 공개 페이지가
  전부 정상 동작합니다. (`npm run dev`로 바로 확인 가능)
- 데이터 조회 코드(`src/lib/data.ts`)는 Supabase 연결 여부를 자동으로 감지해서, Supabase가
  연결되어 있으면 실제 DB 데이터를, 아니면 예시 데이터를 보여줍니다.
- **관리자 페이지(`/admin`)가 완성되어 있습니다.** 로그인 후 사이트의 로고/문구/카드/과정
  등을 목록에서 추가·수정·삭제·순서 변경·공개-비공개 전환할 수 있고, 이미지도 직접
  업로드할 수 있습니다. Supabase 연결 + 관리자 계정 생성이 끝나면 바로 사용할 수 있습니다.

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다. (Supabase 연결 전에는 예시 데이터로
동작하고, 관리자 페이지는 "Supabase가 아직 연결되지 않았습니다" 안내만 보여줍니다.)

## 1단계 · Supabase 연결하기

1. [supabase.com](https://supabase.com) 에서 새 프로젝트를 만듭니다. (무료 플랜으로 시작 가능)
2. 프로젝트의 **SQL Editor** 메뉴에 들어가서 이 저장소의 `supabase/schema.sql` 내용을
   그대로 붙여넣고 실행합니다. (테이블 생성 + RLS 보안 정책 + 이미지 저장 공간 + 기본
   시드 데이터가 한 번에 들어갑니다. 이미 한 번 실행했더라도 다시 실행해도 안전합니다.)
3. 프로젝트의 **Settings > API** 메뉴에서 "Project URL"과 "anon public" 키를 복사합니다.
4. 이 저장소 루트에서 `.env.example`을 `.env.local`로 복사하고, 방금 복사한 값을 채워
   넣습니다.

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

5. 개발 서버를 재시작하면 화면이 `content.ts` 예시 데이터 대신 Supabase의 실제 데이터를
   보여줍니다.

### Supabase 무료 플랜 참고사항

- DB 500MB, 스토리지 1GB, 대역폭 5GB까지 무료입니다. 이 사이트 규모에는 충분합니다.
- **7일간 아무 활동이 없으면 프로젝트가 자동으로 일시정지(pause)** 됩니다. 다시 접속하면
  대시보드에서 수동으로 재개할 수 있지만, 운영 중인 사이트라면 이 점을 감안해서 유료 플랜
  (Pro, $25/월~) 전환을 고려해야 합니다.
- 무료 프로젝트는 계정당 최대 2개까지 동시에 활성화할 수 있습니다.

## 2단계 · 관리자 계정 만들기 (팀 공용 계정 1개)

관리자 페이지는 팀에서 계정 1개를 공유해서 사용하는 방식으로 되어 있습니다. 아래 순서로
한 번만 설정하면 됩니다.

1. Supabase 대시보드 왼쪽 메뉴 **Authentication > Users** 로 들어갑니다.
2. **Add user** 버튼을 눌러 "Create new user"를 선택합니다. 팀에서 사용할 이메일과
   비밀번호를 입력하고, **Auto Confirm User**를 체크한 뒤 생성합니다. (이메일 인증 절차 없이
   바로 로그인 가능한 계정이 만들어집니다)
3. 방금 만든 사용자 목록에서 UUID(예: `a1b2c3d4-...` 형태의 긴 문자열)를 복사합니다.
4. 다시 **SQL Editor**로 가서 아래 SQL을 실행합니다. `여기에_UUID_붙여넣기`와
   `여기에_이메일_붙여넣기` 부분만 방금 복사한 값으로 바꿔주세요.

   ```sql
   insert into admin_users (id, email, name, role)
   values ('여기에_UUID_붙여넣기', '여기에_이메일_붙여넣기', '팀 공용 관리자', 'ADMIN');
   ```

5. 이제 사이트의 `/admin` (예: `http://localhost:3000/admin` 또는 배포 주소 + `/admin`)으로
   접속해서, 2번에서 만든 이메일/비밀번호로 로그인하면 됩니다. 이 계정 정보를 팀원들과
   공유하면 누구든 같은 계정으로 접속해서 콘텐츠를 수정할 수 있습니다.

> 팀원별로 계정을 따로 만들고 싶다면 1~4번을 반복하면 됩니다. `admin_users.role`을
> `SUPER_ADMIN` / `ADMIN` / `EDITOR` 중 하나로 지정할 수 있도록 스키마에 미리 만들어
> 두었지만, 지금 버전의 관리자 페이지는 역할과 상관없이 admin_users에 있으면 모두 동일한
> 권한(전체 수정)을 가집니다.

## 3단계 · 이미지 업로드 확인

`schema.sql`을 실행하면 이미지 업로드용 저장 공간("media" 버킷)도 함께 만들어집니다.
별도 설정 없이 관리자 페이지에서 이미지 선택만 하면 자동으로 업로드됩니다. 혹시
업로드가 안 된다면 Supabase 대시보드 **Storage** 메뉴에 "media"라는 이름의 버킷이
공개(Public)로 만들어져 있는지 확인해주세요.

## 관리자 페이지에서 무엇을 바꿀 수 있나요

`/admin`에 로그인하면 왼쪽 메뉴에서 아래 항목들을 각각 목록으로 보고 추가·수정·삭제·
순서 변경·공개-비공개 전환할 수 있습니다.

- 사이트 전역 설정 — 로고, 사이트 이름, 헤더 메뉴 문구, 홈 화면 히어로 제목/부제목/이미지
- 교육 영역 카테고리, 대표 교육 과정, 커리큘럼 구성 단계 (운영 교육 과정 페이지)
- 교육 문화 프로그램 (교육 문화 페이지)
- 학습자 관리 카드, 학습부진자 지도 계획, 교육 품질 관리, 협업 도구 (교육 관리 페이지)
- 기업 참여 방식, 이런 협업이 가능해요, 협업 사례 (참여 기업 연계 페이지)

저장하면 코드 재배포 없이 공개 페이지에 바로 반영됩니다.

## 배포 (Vercel)

1. 이 저장소를 GitHub 등에 올린 뒤, [vercel.com](https://vercel.com) 에서 새 프로젝트로
   가져옵니다. (Next.js 프로젝트는 별도 설정 없이 자동으로 인식됩니다)
2. Vercel 프로젝트의 **Settings > Environment Variables** 에서 `.env.local`에 넣었던
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 두 값을 그대로 등록합니다.
3. Deploy를 누르면 완료됩니다. 이후에는 main 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

### Vercel 요금제 관련 주의사항

Vercel의 **Hobby(무료) 플랜은 "비상업적, 개인 용도"로만 사용이 허용**됩니다.
([공식 문서](https://vercel.com/docs/plans/hobby)) 이 사이트는 원티드랩의 상업적 교육
사업(부트캠프) 브랜드 웹페이지이므로, 실제 서비스로 배포할 때는 **Pro 플랜(개발자 1인당
월 $20~)**으로 시작하는 것을 권장합니다. 사내 검토/데모 단계에서 잠깐 Hobby로 확인해보는
것은 문제없지만, 정식 운영 전에는 플랜을 전환해야 합니다.

## 폴더 구조

```
src/
  app/                    # 페이지 (App Router)
    page.tsx              # Home
    courses/              # 운영 교육 과정
    education-management/ # 교육 관리
    culture/              # 교육 문화
    partners/             # 참여 기업 연계
    admin/                 # 관리자 페이지 (로그인 + 콘텐츠 관리 12개 메뉴)
  components/
    layout/                # Navbar, Footer, PublicChrome(공개 사이트 vs 관리자 레이아웃 분기)
    ui/                     # Card, SectionHeading, FlowSteps 등 공통 컴포넌트
    admin/                  # ResourceCrud(범용 콘텐츠 관리 화면), 이미지 업로드, 로그인 상태 관리
  lib/
    types.ts               # 데이터 모델 (DB 테이블과 1:1 대응)
    content.ts              # 예시/시드 데이터 (Supabase 연결 전 fallback)
    data.ts                  # 데이터 조회 레이어 (Supabase ↔ 예시 데이터 자동 전환)
    supabase/client.ts        # Supabase 클라이언트 초기화
supabase/
  schema.sql                  # 테이블 생성 + RLS 정책 + 스토리지 버킷 + 초기 시드 SQL (Postgres)
```

## 앞으로 더 다듬으면 좋은 것들

1. 실제 원티드랩 콘텐츠(과정명, 문구, 로고 등)로 교체 — 지금은 예시 데이터입니다.
2. 팀원별 관리자 계정 분리가 필요해지면 2단계 안내를 반복해서 계정을 추가하면 됩니다.
3. 반응형/디테일 마감, 필요 시 페이지별 상세 페이지(`detail_page_enabled`) 추가 구현
