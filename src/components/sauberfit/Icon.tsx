import {
  BedDouble, Building2, DoorOpen, Stethoscope, Factory, AppWindow, HardHat,
  RefreshCw, GraduationCap, SunMedium, ShieldCheck, BadgeCheck, UserCheck,
  FileText, HeartHandshake, Clock, Users, Ruler, Smile, Check, Phone,
  Sparkles, ArrowRight, Star, Mail, Globe, Lock, Leaf, Award,
} from "lucide-react";
import type { ComponentType } from "react";

type IconProps = { size?: number; className?: string; strokeWidth?: number };

const MAP: Record<string, ComponentType<IconProps>> = {
  BedDouble, Building2, DoorOpen, Stethoscope, Factory, AppWindow, HardHat,
  RefreshCw, GraduationCap, SunMedium, ShieldCheck, BadgeCheck, UserCheck,
  FileText, HeartHandshake, Clock, Users, Ruler, Smile, Check, Phone,
  Sparkles, ArrowRight, Star, Mail, Globe, Lock, Leaf, Award,
};

export function Icon({ name, size = 22, className, strokeWidth = 1.8 }: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const C = MAP[name] ?? Sparkles;
  return <C size={size} className={className} strokeWidth={strokeWidth} />;
}
