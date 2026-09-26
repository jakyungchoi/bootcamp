"use client";

// 참여 신청 팝업 폼("참여 신청하기") 자체를 구성하는 설정을 모아서 편집하는 화면.
// 예전에는 "사이트 전역 설정"에 있었는데, 실제로 이 폼이 뜨는 위치(참여 희망 방식/함께 하는
// 방법 메뉴)와 떨어져 있어서 헷갈린다는 의견에 따라 이 메뉴로 옮겨왔다.
// site_settings 테이블의 폼 관련 컬럼만 따로 불러오고 저장해서, 다른 화면(사이트 전역 설정)의
// 저장과 서로 덮어쓰지 않는다.

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type {
  PartnersCustomField,
  PartnersFieldLabels,
  PartnersFieldVisibility,
  PartnersFormFieldKey,
  PartnersRequiredFields,
} from "@/lib/types";

type FormState = {
  partners_meeting_options: string[];
  partners_privacy_notice: string;
  partners_submit_notice: string;
  partners_required_fields: PartnersRequiredFields;
  partners_field_labels: PartnersFieldLabels;
  partners_field_visibility: PartnersFieldVisibility;
  partners_custom_fields: PartnersCustomField[];
};

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

const DEFAULT_FIELD_VISIBILITY: PartnersFieldVisibility = {
  companyName: true,
  contactName: true,
  department: true,
  position: true,
  email: true,
  phone: true,
  participationTypes: true,
  meetingMethod: true,
  request: true,
  message: true,
};

const FIELD_ITEMS: { key: PartnersFormFieldKey }[] = [
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

export function PartnersFormSettingsEditor({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (err) setError(err.message);
      else if (data) {
        setForm({
          partners_meeting_options: data.partners_meeting_options ?? [],
          partners_privacy_notice: data.partners_privacy_notice ?? "",
          partners_submit_notice: data.partners_submit_notice ?? "",
          partners_required_fields: { ...DEFAULT_REQUIRED_FIELDS, ...(data.partners_required_fields ?? {}) },
          partners_field_labels: { ...DEFAULT_FIELD_LABELS, ...(data.partners_field_labels ?? {}) },
          partners_field_visibility: { ...DEFAULT_FIELD_VISIBILITY, ...(data.partners_field_visibility ?? {}) },
          partners_custom_fields: data.partners_custom_fields ?? [],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleRequiredField(key: PartnersFormFieldKey) {
    setForm((f) =>
      f ? { ...f, partners_required_fields: { ...f.partners_required_fields, [key]: !f.partners_required_fields[key] } } : f,
    );
  }

  function toggleFieldVisibility(key: PartnersFormFieldKey) {
    setForm((f) =>
      f
        ? { ...f, partners_field_visibility: { ...f.partners_field_visibility, [key]: !f.partners_field_visibility[key] } }
        : f,
    );
  }

  function updateFieldLabel(key: PartnersFormFieldKey, value: string) {
    setForm((f) => (f ? { ...f, partners_field_labels: { ...f.partners_field_labels, [key]: value } } : f));
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
    setForm((f) => (f ? { ...f, partners_meeting_options: f.partners_meeting_options.filter((_, i) => i !== idx) } : f));
  }

  function addCustomField() {
    setForm((f) => {
      if (!f) return f;
      const newField: PartnersCustomField = {
        id: `custom-${Math.random().toString(36).slice(2, 8)}`,
        label: "",
        required: false,
      };
      return { ...f, partners_custom_fields: [...f.partners_custom_fields, newField] };
    });
  }

  function updateCustomField(idx: number, patch: Partial<PartnersCustomField>) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.partners_custom_fields];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, partners_custom_fields: next };
    });
  }

  function removeCustomField(idx: number) {
    if (!confirm("이 항목을 삭제할까요? 구글 시트에서도 해당 열을 함께 정리해주세요.")) return;
    setForm((f) => (f ? { ...f, partners_custom_fields: f.partners_custom_fields.filter((_, i) => i !== idx) } : f));
  }

  function moveCustomField(idx: number, direction: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= f.partners_custom_fields.length) return f;
      const next = [...f.partners_custom_fields];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...f, partners_custom_fields: next };
    });
  }

  async function handleSave() {
    if (!supabase || !form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase.from("site_settings").update(form).eq("id", 1);
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-400">
        <Loader2 className="mr-1 inline animate-spin" size={14} /> 불러오는 중...
      </div>
    );
  }
  if (!form) {
    return <p className="mb-6 text-sm text-red-500">{error ?? "설정을 불러오지 못했습니다."}</p>;
  }

  return (
    <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold text-neutral-800">참여 신청 팝업 폼</h2>
      <p className="mt-1 text-sm text-neutral-500">
        &quot;참여 신청하기&quot; 버튼을 누르면 뜨는 팝업 폼의 내용입니다. 폼에 입력된 내용은 구글
        시트에 자동으로 기록되며, 그 연동 주소는 보안을 위해 이 화면이 아니라 배포 환경 변수로
        별도 설정합니다 — 자세한 설정 방법은 README의 &quot;참여 신청 폼 → 구글 시트 연동
        설정&quot; 항목을 참고하거나 개발 담당자에게 요청해주세요. 연동이 설정되어 있지 않으면
        공개 화면에 버튼 자체가 표시되지 않습니다.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            기본 제공 항목 — 표시 · 필수 여부 · 이름
          </label>
          <p className="mb-2 text-xs text-neutral-400">
            &quot;표시&quot;를 끄면 그 항목이 폼에서 완전히 사라집니다(삭제한 것과 같습니다).
            &quot;필수&quot;를 체크한 항목은 이름 뒤에 별표(*)가 붙고 비워둔 채로는 제출할 수
            없습니다. (&quot;위 내용에 동의합니다&quot; 체크박스는 항상 표시·필수입니다)
          </p>
          <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
            <div className="grid grid-cols-[3.5rem_3.5rem_1fr] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              <span>표시</span>
              <span>필수</span>
              <span>이름</span>
            </div>
            {FIELD_ITEMS.map(({ key }) => (
              <div key={key} className="grid grid-cols-[3.5rem_3.5rem_1fr] items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.partners_field_visibility[key]}
                  onChange={() => toggleFieldVisibility(key)}
                  className="h-4 w-4 justify-self-center rounded border-neutral-300 text-brand focus:ring-brand"
                  aria-label="표시"
                />
                <input
                  type="checkbox"
                  checked={form.partners_required_fields[key]}
                  onChange={() => toggleRequiredField(key)}
                  disabled={!form.partners_field_visibility[key]}
                  className="h-4 w-4 justify-self-center rounded border-neutral-300 text-brand focus:ring-brand disabled:opacity-30"
                  aria-label="필수"
                />
                <input
                  type="text"
                  value={form.partners_field_labels[key]}
                  onChange={(e) => updateFieldLabel(key, e.target.value)}
                  disabled={!form.partners_field_visibility[key]}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">추가한 항목 (직접 추가)</label>
            <button
              type="button"
              onClick={addCustomField}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <Plus size={12} />
              항목 추가
            </button>
          </div>
          <p className="mb-2 text-xs text-neutral-400">
            위 기본 제공 항목 외에 새로운 한 줄 입력 항목을 자유롭게 추가할 수 있습니다. 추가한
            값은 구글 시트에 기존 항목 뒤에 이 목록 순서 그대로 새 열로 기록되므로, 항목을
            추가·삭제·순서 변경하면 구글 시트의 머리글 행도 같은 순서로 함께 맞춰주세요.
          </p>
          <div className="space-y-2">
            {form.partners_custom_fields.map((field, idx, arr) => (
              <div key={field.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveCustomField(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="위로"
                  >
                    <span className="block text-xs leading-none">▲</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCustomField(idx, 1)}
                    disabled={idx === arr.length - 1}
                    className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="아래로"
                  >
                    <span className="block text-xs leading-none">▼</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={field.label}
                  placeholder="항목 이름 (예: 웹사이트 주소)"
                  onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
                <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateCustomField(idx, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand"
                  />
                  필수
                </label>
                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {form.partners_custom_fields.length === 0 && (
              <p className="text-sm text-neutral-400">
                추가한 항목이 없습니다. &quot;항목 추가&quot;로 새 입력칸을 만들어보세요.
              </p>
            )}
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
          <label className="mb-1 block text-sm font-medium text-neutral-700">개인정보 수집·이용 동의 문구</label>
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

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-xs text-green-600">저장했습니다</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </section>
  );
}
