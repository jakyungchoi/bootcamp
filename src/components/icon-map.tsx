import {
  Building2,
  CalendarCheck,
  Database,
  Lightbulb,
  LifeBuoy,
  LineChart,
  Mic2,
  Presentation,
  Server,
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
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Lightbulb;
  return <Cmp className={className} strokeWidth={1.75} />;
}
