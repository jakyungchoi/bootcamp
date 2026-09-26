"use client";

// 관리자 대시보드.
// - 기존 메뉴는 이름 변경 / 순서 변경 / 메뉴에서 숨기기가 가능하다. 데이터 자체는 삭제되지 않지만,
//   "숨기기"를 하면 운영 교육 과정 / 교육 관리 / 참여 기업 연계 페이지의 해당 섹션은 공개 화면에서도
//   함께 사라지고, 남은 섹션 번호(01, 02, ...)가 자동으로 다시 매겨진다. (사이트 전역 설정, 페이지 상단
//   문구, 교육 문화 프로그램은 화면 전체 문구/단일 목록이라 숨기기가 관리자 메뉴에서만 적용된다.)
// - 이름 변경(연필 아이콘)도 마찬가지로, 운영 교육 과정 / 교육 관리 / 참여 기업 연계 페이지의 해당 섹션
//   제목 글자 자체가 공개 화면에도 그대로 반영된다. (역시 사이트 전역 설정, 페이지 상단 문구, 교육 문화
//   프로그램은 제외 — 이 메뉴들은 관리자 메뉴 이름만 바뀌고 공개 화면 문구는 각 항목 편집 화면에서 직접
//   수정해야 한다.)
// - "새 탭 추가" 버튼으로 완전히 새로운 페이지(탭)를 만들 수 있고, 그 탭은 이름 변경과 완전한 삭제가 가능하다.
//   새로 추가한 탭은 /pages/[주소] 로 공개 사이트에서도 바로 열어볼 수 있다.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getMergedAdminMenu, groupLabelForKey, customKeyToId, type MergedMenuItem } from "@/lib/admin-menu";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<MergedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const merged = await getMergedAdminMenu();
    setLoading(false);
    return merged;
  }

  useEffect(() => {
    async function init() {
      const merged = await load();
      setItems(merged);
    }
    init();
  }, []);

  async function reload() {
    const merged = await load();
    setItems(merged);
  }

  async function handleRename(item: MergedMenuItem) {
    const next = window.prompt("탭 이름을 입력하세요.", item.label);
    if (next === null || !supabase) return;
    const label = next.trim();
    if (!label) return;
    const { error: err } = item.isCustom
      ? await supabase.from("custom_pages").update({ title: label }).eq("id", customKeyToId(item.key))
      : await supabase.from("admin_menu_overrides").upsert({ key: item.key, label });
    if (err) {
      setError(err.message);
      return;
    }
    reload();
  }

  async function handleToggleVisible(item: MergedMenuItem) {
    if (!supabase || item.isCustom) return;
    const { error: err } = await supabase
      .from("admin_menu_overrides")
      .upsert({ key: item.key, is_visible: !item.isVisible });
    if (err) {
      setError(err.message);
      return;
    }
    reload();
  }

  async function handleDeleteCustom(item: MergedMenuItem) {
    if (!supabase || !item.isCustom) return;
    if (!confirm(`"${item.label}" 탭을 삭제할까요? 페이지 내용도 함께 삭제되며 되돌릴 수 없습니다.`)) return;
    const { error: err } = await supabase.from("custom_pages").delete().eq("id", customKeyToId(item.key));
    if (err) {
      setError(err.message);
      return;
    }
    reload();
  }

  async function move(item: MergedMenuItem, direction: -1 | 1) {
    if (!supabase) return;
    const idx = items.findIndex((i) => i.key === item.key);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const target = items[targetIdx];
    const client = supabase;

    async function setOrder(it: MergedMenuItem, order: number) {
      if (it.isCustom) {
        return client.from("custom_pages").update({ order }).eq("id", customKeyToId(it.key));
      }
      return client.from("admin_menu_overrides").upsert({ key: it.key, order });
    }

    const results = await Promise.all([setOrder(item, target.order), setOrder(target, item.order)]);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setError(failed.error.message);
      return;
    }
    reload();
  }

  async function handleAddTab() {
    if (!supabase) return;
    const title = window.prompt("새 탭 이름을 입력하세요. (예: 자주 묻는 질문)");
    if (!title || !title.trim()) return;
    const slug = `page-${Math.random().toString(36).slice(2, 8)}`;
    const customOrders = items.filter((i) => i.isCustom).map((i) => i.order - 1000);
    const nextOrder = customOrders.length > 0 ? Math.max(...customOrders) + 1 : 1;
    const { data, error: err } = await supabase
      .from("custom_pages")
      .insert({ title: title.trim(), slug, order: nextOrder })
      .select()
      .single();
    if (err || !data) {
      setError(err?.message ?? "탭을 추가하지 못했습니다.");
      return;
    }
    router.push(`/admin/custom-pages/${data.id}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-neutral-500">
            수정하고 싶은 화면을 선택하세요. 저장하면 공개 사이트에 바로 반영됩니다. 카드 아래 아이콘으로 이름
            변경 · 순서 변경 · 숨기기가 가능하고, 완전히 새로운 탭도 추가할 수 있습니다. 대부분의 메뉴는
            이름을 바꾸면 공개 화면의 섹션 제목도 함께 바뀌고, 숨기면 해당 섹션이 통째로 사라지면서 남은
            섹션 번호가 자동으로 다시 매겨집니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddTab}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          새 탭 추가
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 py-10 text-neutral-400">
          <Loader2 className="animate-spin" size={18} /> 불러오는 중...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(() => {
            // 관련된 탭끼리 묶어서 구분선 + 그룹 이름을 보여준다 (사이드바와 동일한 그룹 기준).
            const groups = items.map((it) => groupLabelForKey(it.key, it.isCustom));
            return items.map((item, idx) => {
              const group = groups[idx];
              const showGroupLabel = idx === 0 || group !== groups[idx - 1];
              return (
                <Fragment key={item.key}>
                  {showGroupLabel && (
                    <div className={`col-span-full ${idx === 0 ? "" : "mt-2 border-t border-neutral-200 pt-5"}`}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{group}</p>
                    </div>
                  )}
                  <div
                    className={`rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm ${
                      !item.isVisible ? "opacity-50" : ""
                    }`}
                  >
                    <Link href={item.href} className="block">
                      <p className="font-semibold text-neutral-800">
                        {item.label}
                        {!item.isVisible && (
                          <span className="ml-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                            숨김
                          </span>
                        )}
                      </p>
                      {item.isCustom ? (
                        <p className="mt-1 text-sm text-neutral-500">공개 주소: /pages/{item.slug}</p>
                      ) : (
                        item.desc && <p className="mt-1 text-sm text-neutral-500">{item.desc}</p>
                      )}
                    </Link>
                    <div className="mt-3 flex items-center gap-1 border-t border-neutral-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => move(item, -1)}
                        disabled={idx === 0}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                        aria-label="위로"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(item, 1)}
                        disabled={idx === items.length - 1}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                        aria-label="아래로"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRename(item)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
                        aria-label="이름 수정"
                      >
                        <Pencil size={14} />
                      </button>
                      {item.isCustom ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(item)}
                          className="ml-auto rounded p-1.5 text-red-400 hover:bg-red-50"
                          aria-label="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(item)}
                          className="ml-auto rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
                          aria-label={item.isVisible ? "메뉴에서 숨기기" : "메뉴에 표시"}
                        >
                          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
