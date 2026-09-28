import {
  Award,
  Briefcase,
  Building2,
  CalendarCheck,
  Database,
  FileSearch,
  GraduationCap,
  Lightbulb,
  LifeBuoy,
  LineChart,
  MessageCircle,
  Mic2,
  Presentation,
  Server,
  Sparkles,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  CalendarCheck,
  Users,
  LifeBuoy,
  LineChart,
  Lightbulb,
  Database,
  Server,
  Presentation,
  Users2,
  Mic2,
  Building2,
  MessageCircle,
  GraduationCap,
  Briefcase,
  Award,
  FileSearch,
  Sparkles,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Lightbulb;
  return <Cmp className={className} strokeWidth={1.75} />;
}
