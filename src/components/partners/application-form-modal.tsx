"use client";

// 참여 기업 연계 페이지의 "참여 신청하기" 버튼을 누르면 뜨는 팝업 폼.
// 제출 시 /api/partners-application 으로 보내고, 그 서버 라우트가 구글 시트에 기록한다.

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import type { PartnersFieldLabels, PartnersRequiredFields } from "@/lib/types";

type ApplicationFormModalProps = {
  participationOptions: string[];
  meetingOptions: string[];
  privacyNotice: string;
  submitNotice: string;
  requiredFields: PartnersRequiredFields;
  fieldLabels: PartnersFieldLabels;
  onClose: () => void;
};

// 전화번호를 입력하는 대로 "010-0000-0000" 형태로 자동으로 하이픈을 넣어준다.
// 숫자만 남긴 뒤 자릿수에 맞춰 나눠 붙이는 방식이라, 붙여넣기를 하든 하나씩 입력하든 똑같이 동작한다.
function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.startsWith("02")) {
    // 서울 지역번호(02)는 다른 지역보다 한 자리 짧다.
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

type FormState = {
  companyName: string;
  contactName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  participationTypes: string[];
  meetingMethod: string;
  request: string;
  message: string;
  agree: boolean;
};

const initialState: FormState = {
  companyName: "",
  contactName: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  participationTypes: [],
  meetingMethod: "",
  request: "",
  message: "",
  agree: false,
};

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none dark:border-white/15 dark:bg-neutral-800 dark:text-white";
const labelClass = "mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200";

export function ApplicationFormModal({
  participationOptions,
  meetingOptions,
  privacyNotice,
  submitNotice,
  requiredFields,
  fieldLabels,
  onClose,
}: ApplicationFormModalProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleParticipationType(title: string) {
    setForm((f) => ({
      ...f,
      participationTypes: f.participationTypes.includes(title)
        ? f.participationTypes.filter((t) => t !== title)
        : [...f.participationTypes, title],
    }));
  }

  const canSubmit =
    (!requiredFields.companyName || form.companyName.trim() !== "") &&
    (!requiredFields.contactName || form.contactName.trim() !== "") &&
    (!requiredFields.department || form.department.trim() !== "") &&
    (!requiredFields.position || form.position.trim() !== "") &&
    (!requiredFields.email || form.email.trim() !== "") &&
    (!requiredFields.phone || form.phone.trim() !== "") &&
    (!requiredFields.participationTypes || form.participationTypes.length > 0) &&
    (!requiredFields.meetingMethod || form.meetingMethod !== "") &&
    (!requiredFields.request || form.request.trim() !== "") &&
    (!requiredFields.message || form.message.trim() !== "") &&
    form.agree &&
    !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partners-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          department: form.department,
          position: form.position,
          email: form.email,
          phone: form.phone,
          participationTypes: form.participationTypes,
          meetingMethod: form.meetingMethod,
          request: form.request,
          message: form.message,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        <div className="border-b border-black/5 px-6 py-4 dark:border-white/10">
          <p className="font-bold text-neutral-900 dark:text-white">참여 신청하기</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <CheckCircle2 size={40} className="text-brand" />
            <p className="font-bold text-neutral-900 dark:text-white">신청이 정상적으로 접수되었습니다.</p>
            <p className="whitespace-pre-line text-sm text-neutral-500 dark:text-neutral-400">{submitNotice}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div>
              <label className={labelClass}>{fieldLabels.companyName}{requiredFields.companyName && " *"}</label>
              <input
                type="text"
                required={requiredFields.companyName}
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{fieldLabels.contactName}{requiredFields.contactName && " *"}</label>
                <input
                  type="text"
                  required={requiredFields.contactName}
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{fieldLabels.department}{requiredFields.department && " *"}</label>
                <input
                  type="text"
                  required={requiredFields.department}
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{fieldLabels.position}{requiredFields.position && " *"}</label>
              <input
                type="text"
                required={requiredFields.position}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{fieldLabels.email}{requiredFields.email && " *"}</label>
                <input
                  type="email"
                  required={requiredFields.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{fieldLabels.phone}{requiredFields.phone && " *"}</label>
                <input
                  type="tel"
                  required={requiredFields.phone}
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {fieldLabels.participationTypes}{requiredFields.participationTypes && " *"} (복수 선택 가능)
              </label>
              <div className="space-y-1.5 rounded-lg border border-neutral-200 p-3 dark:border-white/10">
                {participationOptions.map((title) => (
                  <label key={title} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={form.participationTypes.includes(title)}
                      onChange={() => toggleParticipationType(title)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand"
                    />
                    {title}
                  </label>
                ))}
                {participationOptions.length === 0 && (
                  <p className="text-sm text-neutral-400">등록된 참여 방식이 없습니다.</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>{fieldLabels.meetingMethod}{requiredFields.meetingMethod && " *"}</label>
              <div className="space-y-1.5 rounded-lg border border-neutral-200 p-3 dark:border-white/10">
                {meetingOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                    <input
                      type="radio"
                      name="meetingMethod"
                      required={requiredFields.meetingMethod}
                      checked={form.meetingMethod === option}
                      onChange={() => setForm({ ...form, meetingMethod: option })}
                      className="h-4 w-4 border-neutral-300 text-brand focus:ring-brand"
                    />
                    {option}
                  </label>
                ))}
                {meetingOptions.length === 0 && (
                  <p className="text-sm text-neutral-400">등록된 만남 방식이 없습니다.</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>{fieldLabels.request}{requiredFields.request && " *"}</label>
              <textarea
                required={requiredFields.request}
                rows={3}
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>{fieldLabels.message}{requiredFields.message && " *"}</label>
              <textarea
                required={requiredFields.message}
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>개인정보 수집·이용 동의</label>
              <div className="max-h-32 overflow-y-auto whitespace-pre-line rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400">
                {privacyNotice}
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand"
                />
                위 내용에 동의합니다 *
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              제출하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
