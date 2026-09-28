// 관리자 화면에서 "아이콘" 선택 목록으로 공통으로 쓰는 값. 실제 아이콘 그림은
// src/components/icon-map.tsx 의 ICONS 목록과 이름이 반드시 같아야 한다 (여기 추가하면
// icon-map.tsx에도 같은 이름으로 추가해야 화면에 그림이 나온다).
export const ICON_OPTIONS = [
  "CalendarCheck",
  "Users",
  "LifeBuoy",
  "LineChart",
  "Lightbulb",
  "Database",
  "Server",
  "Presentation",
  "Users2",
  "Mic2",
  "Building2",
  "MessageCircle",
  "GraduationCap",
  "Briefcase",
  "Award",
  "FileSearch",
  "Sparkles",
].map((v) => ({ value: v, label: v }));
