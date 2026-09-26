"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import type { HomeHighlight, NavItem, PartnersFieldLabels, PartnersRequiredFields } from "@/lib/types";

type SettingsForm = {
  site_name: string;
  logo_url: string | null;
  footer_description: string;
  home_hero_eyebrow: string;
  home_hero_title: string;
  home_hero_subtitle: string;
  home_hero_image_url: string | null;
  home_highlights: HomeHighlight[];
  nav_items: NavItem[];
  partners_meeting_options: string[];
  partners_privacy_notice: string;
  partners_submit_notice: string;
  partners_required_fields: PartnersRequiredFields;
  partners_field_labels: PartnersFieldLabels;
};

// 신청 폼 필드가 DB에 아직 없을 때(과거 데이터)를 위한 기본값. supabase/schema.sql의 기본값과 맞춘다.
const DEFAULT_REQUIRED_FIELDS: PartnersRequiredFields = {
  companyName: true,
  contactName: true,
  department: false,
  position: false,
  email: true,
  phone: true,
  participationTypes: true,
  meetingMethod: true,
  request: true,
  message: false,
};

const DEFAULT_FIELD_LABELS: PartnersFieldLabels = {
  companyName: "기업명",
  contactName: "담당자명",
  department: "부서",
  position: "직급 / 직책",
  email: "이메일",
  phone: "연락처",
  participationTypes: "참여 희망 방식",
  meetingMethod: "만남 방식",
  request: "문의 / 요청 내용",
  message: "남기실 말씀",
};

// 신청 폼에 실제로 보이는 순서 그대로 나열한다 (관리자 화면의 순서와도 맞춘다).
const REQUIRED_FIELD_ITEMS: { key: keyof PartnersRequiredFields }[] = [
  { key: "companyName" },
  { key: "contactName" },
  { key: "department" },
  { key: "position" },
  { key: "email" },
  { key: "phone" },
  { key: "participationTypes" },
  { key: "meetingMethod" },
  { key: "request" },
  { key: "message" },
];

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewRefreshToken, setPreviewRefreshToken] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data, error: err } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (err) setError(err.message);
      else if (data) {
        setForm({
          site_name: data.site_name,
          logo_url: data.logo_url,
          footer_description: data.footer_description,
          home_hero_eyebrow: data.home_hero_eyebrow ?? "Wanted Lab Education",
          home_hero_title: data.home_hero_title,
          home_hero_subtitle: data.home_hero_subtitle,
          home_hero_image_url: data.home_hero_image_url,
          home_highlights: data.home_highlights,
          nav_items: data.nav_items,
          partners_meeting_options: data.partners_meeting_options ?? [],
          partners_privacy_notice: data.partners_privacy_notice ?? "",
          partners_submit_notice: data.partners_submit_notice ?? "",
          partners_required_fields: { ...DEFAULT_REQUIRED_FIELDS, ...(data.partners_required_fields ?? {}) },
          partners_field_labels: { ...DEFAULT_FIELD_LABELS, ...(data.partners_field_labels ?? {}) },
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateHighlight(idx: number, patch: Partial<HomeHighlight>) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.home_highlights];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, home_highlights: next };
    });
  }

  function addHighlight() {
    setForm((f) => {
      if (!f) return f;
      const newItem: HomeHighlight = {
        key: `item-${Math.random().toString(36).slice(2, 8)}`,
        href: "",
        title: "",
        eyebrow: "",
        description: "",
      };
      return { ...f, home_highlights: [...f.home_highlights, newItem] };
    });
  }

  function removeHighlight(idx: number) {
    if (!confirm("이 홈 화면 카드를 삭제할까요?")) return;
    setForm((f) => {
      if (!f) return f;
      return { ...f, home_highlights: f.home_highlights.filter((_, i) => i !== idx) };
    });
  }

  function toggleRequiredField(key: keyof PartnersRequiredFields) {
    setForm((f) =>
      f
        ? { ...f, partners_required_fields: { ...f.partners_required_fields, [key]: !f.partners_required_fields[key] } }
        : f,
    );
  }

  function updateFieldLabel(key: keyof PartnersFieldLabels, value: string) {
    setForm((f) =>
      f ? { ...f, partners_field_labels: { ...f.partners_field_labels, [key]: value } } : f,
    );
  }

  function updateMeetingOption(idx: number, value: string) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.partners_meeting_options];
      next[idx] = value;
      return { ...f, partners_meeting_options: next };
    });
  }

  function addMeetingOption() {
    setForm((f) => (f ? { ...f, partners_meeting_options: [...f.partners_meeting_options, ""] } : f));
  }

  function removeMeetingOption(idx: number) {
    setForm((f) =>
      f ? { ...f, partners_meeting_options: f.partners_meeting_options.filter((_, i) => i !== idx) } : f,
    );
  }

  function updateNavItem(idx: number, patch: Partial<NavItem>) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.nav_items];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, nav_items: next };
    });
  }

  function addNavItem() {
    setForm((f) => {
      if (!f) return f;
      const newItem: NavItem = {
        key: `nav-${Math.random().toString(36).slice(2, 8)}`,
        href: "",
        title: "",
      };
      return { ...f, nav_items: [...f.nav_items, newItem] };
    });
  }

  function removeNavItem(idx: number) {
    if (!confirm("이 헤더 메뉴 항목을 삭제할까요?")) return;
    setForm((f) => {
      if (!f) return f;
      return { ...f, nav_items: f.nav_items.filter((_, i) => i !== idx) };
    });
  }

  async function handleSave() {
    if (!supabase || !form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase.from("site_settings").update(form).eq("id", 1);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setPreviewRefreshToken((n) => n + 1);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return <div className="py-10 text-center text-neutral-400"><Loader2 className="mx-auto animate-spin" /></div>;
  }
  if (!form) {
    return <p className="text-sm text-red-500">{error ?? "설정을 불러오지 못했습니다."}</p>;
  }

  return (
    <AdminContentLayout
      refreshToken={previewRefreshToken}
      previewOptions={[
        { label: "홈", path: "/" },
        { label: "운영 교육 과정", path: "/courses" },
        { label: "교육 관리", path: "/education-management" },
        { label: "교육 문화", path: "/culture" },
        { label: "참여 기업 연계 (참여 신청 폼)", path: "/partners#admin-section-participation-types" },
      ]}
    >
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900">사이트 전역 설정</h1>
      <p className="mt-1 text-sm text-neutral-500">
        로고, 사이트 이름, 헤더 메뉴 문구, 홈 화면 히어로 문구를 관리합니다.
      </p>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">기본 정보</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">로고</label>
            <ImageUploadField
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              folder="site"
            />
            <p className="mt-1 text-xs text-neutral-400">
              로고를 올리지 않으면 사이트 이름의 첫 글자가 아이콘으로 표시됩니다.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">사이트 이름</label>
            <input
              type="text"
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">푸터 소개 문구</label>
            <textarea
              value={form.footer_description}
              rows={3}
              onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">홈 화면 히어로</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              상단 영문 소제목 (예: WANTED LAB EDUCATION)
            </label>
            <input
              type="text"
              value={form.home_hero_eyebrow}
              onChange={(e) => setForm({ ...form, home_hero_eyebrow: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">제목</label>
            <input
              type="text"
              value={form.home_hero_title}
              onChange={(e) => setForm({ ...form, home_hero_title: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">부제목</label>
            <textarea
              value={form.home_hero_subtitle}
              rows={2}
              onChange={(e) => setForm({ ...form, home_hero_subtitle: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">히어로 이미지</label>
            <ImageUploadField
              value={form.home_hero_image_url}
              onChange={(url) => setForm({ ...form, home_hero_image_url: url })}
              folder="site"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">참여 기업 연계 — 참여 신청 팝업 폼</h2>
        <p className="mt-1 text-sm text-neutral-500">
          참여 기업 연계 페이지의 &quot;참여 신청하기&quot; 버튼을 누르면 뜨는 팝업 폼의 내용입니다. 폼에
          입력된 내용은 구글 시트에 자동으로 기록되며, 그 연동 주소는 보안을 위해 이 화면이 아니라
          배포 환경 변수로 별도 설정합니다 — 자세한 설정 방법은 README의 &quot;참여 신청 폼 → 구글 시트
          연동 설정&quot; 항목을 참고하거나 개발 담당자에게 요청해주세요. 연동이 설정되어 있지 않으면
          공개 화면에 버튼 자체가 표시되지 않습니다. 폼의 &quot;참여 희망 방식&quot; 체크박스 목록은 위
          &quot;기업 참여 방식&quot; 관리 화면의 항목을 그대로 사용합니다.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              입력 항목 이름 · 필수 여부
            </label>
            <p className="mb-2 text-xs text-neutral-400">
              폼에 실제로 표시되는 항목 이름(라벨)을 자유롭게 바꿀 수 있습니다. 체크한 항목은 이름
              뒤에 별표(*)가 붙고 비워둔 채로는 제출할 수 없으며, 체크를 풀면 방문자가 입력하지
              않고 넘어갈 수 있는 선택 항목이 됩니다. (&quot;위 내용에 동의합니다&quot; 체크박스는
              항상 필수입니다)
            </p>
            <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
              {REQUIRED_FIELD_ITEMS.map(({ key }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <input
                      type="checkbox"
                      checked={form.partners_required_fields[key]}
                      onChange={() => toggleRequiredField(key)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand"
                    />
                    필수
                  </label>
                  <input
                    type="text"
                    value={form.partners_field_labels[key]}
                    onChange={(e) => updateFieldLabel(key, e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700">만남 방식 선택지</label>
              <button
                type="button"
                onClick={addMeetingOption}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                <Plus size={12} />
                선택지 추가
              </button>
            </div>
            <div className="space-y-2">
              {form.partners_meeting_options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    placeholder="예: 30분 온라인 미팅"
                    onChange={(e) => updateMeetingOption(idx, e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMeetingOption(idx)}
                    className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50"
                    aria-label="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {form.partners_meeting_options.length === 0 && (
                <p className="text-sm text-neutral-400">
                  선택지가 없으면 폼에서 만남 방식을 고를 수 없습니다. &quot;선택지 추가&quot;로
                  만들어보세요.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              개인정보 수집·이용 동의 문구
            </label>
            <textarea
              value={form.partners_privacy_notice}
              rows={5}
              onChange={(e) => setForm({ ...form, partners_privacy_notice: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">
              폼 하단에 그대로 표시되는 문구입니다. 줄바꿈은 입력한 그대로 반영됩니다.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">제출 완료 안내 문구</label>
            <input
              type="text"
              value={form.partners_submit_notice}
              onChange={(e) => setForm({ ...form, partners_submit_notice: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">
              방문객이 제출하기를 누른 직후에 보여지는 안내 문구입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-neutral-800">헤더 메뉴</h2>
            <p className="mt-1 text-sm text-neutral-500">
              화면 맨 위 상단 내비게이션에 표시되는 메뉴입니다. 아래 홈 화면 카드와는 별개로, 개수나 이름이
              달라도 됩니다. 새 탭(커스텀 페이지)을 추가했다면 그 페이지의 공개 주소(/pages/...)를 링크
              주소에 입력해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={addNavItem}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <Plus size={13} />
            메뉴 추가
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {form.nav_items.map((item, idx) => (
            <div key={item.key} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">메뉴 {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeNavItem(idx)}
                  className="rounded p-1 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={item.title}
                  placeholder="메뉴 이름"
                  onChange={(e) => updateNavItem(idx, { title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={item.href}
                  placeholder="링크 주소 (예: /courses 또는 /pages/faq)"
                  onChange={(e) => updateNavItem(idx, { href: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          ))}
          {form.nav_items.length === 0 && (
            <p className="text-sm text-neutral-400">
              메뉴가 없으면 헤더 메뉴도 비어 보입니다. &quot;메뉴 추가&quot;로 만들어보세요.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-neutral-800">홈 화면 핵심 영역 카드</h2>
            <p className="mt-1 text-sm text-neutral-500">
              홈 화면에 표시되는 카드입니다. 위 헤더 메뉴와는 별개로, 개수나 이름이 달라도 됩니다. 아래
              &quot;카드 설명&quot;은 홈 화면에서만 보이는 짧은 소개 문구이고, 그 페이지에 실제로
              들어갔을 때 맨 위에 나오는 설명 문단은 이것과 별개로 &quot;페이지 상단 문구&quot; 메뉴에서
              따로 관리합니다. 두 문구는 같을 필요가 없습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={addHighlight}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <Plus size={13} />
            카드 추가
          </button>
        </div>
        <div className="mt-4 space-y-5">
          {form.home_highlights.map((h, idx) => (
            <div key={h.key} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">항목 {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="rounded p-1 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={h.title}
                  placeholder="카드 제목"
                  onChange={(e) => updateHighlight(idx, { title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={h.href}
                  placeholder="링크 주소 (예: /courses 또는 /pages/faq)"
                  onChange={(e) => updateHighlight(idx, { href: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={h.eyebrow}
                  placeholder="영문 소제목 (예: What we teach)"
                  onChange={(e) => updateHighlight(idx, { eyebrow: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <textarea
                  value={h.description}
                  rows={2}
                  placeholder="카드 설명"
                  onChange={(e) => updateHighlight(idx, { description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          ))}
          {form.home_highlights.length === 0 && (
            <p className="text-sm text-neutral-400">
              카드가 없으면 홈 화면 영역도 비어 보입니다. &quot;카드 추가&quot;로 만들어보세요.
            </p>
          )}
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          저장
        </button>
        {saved && <span className="text-sm text-emerald-600">저장되었습니다.</span>}
      </div>
    </div>
    </AdminContentLayout>
  );
}
