import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Cloud,
  Crown,
  KeyRound,
  Layers,
  LayoutTemplate,
  Puzzle,
  Server,
  Sparkles,
  Webhook,
} from "lucide-react";
import type { CategorySlug } from "@/lib/types";

export const categoryIcons: Record<CategorySlug, LucideIcon> = {
  sistemas: Layers,
  apis: Webhook,
  templates: LayoutTemplate,
  plugins: Puzzle,
  licencas: KeyRound,
  saas: Cloud,
  ia: Sparkles,
  "white-label": BadgeCheck,
  hospedagem: Server,
  assinaturas: Crown,
};
