import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 환경변수가 설정되어 있지 않으면 null.
// data.ts 는 이 값이 null 이면 src/lib/content.ts 의 목업 데이터를 사용한다.
// -> Supabase 프로젝트를 연결하기 전까지는 목업 데이터로, 연결 후에는 실제 DB 데이터로 자동 전환된다.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
