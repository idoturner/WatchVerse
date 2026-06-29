import { Check, Library, PenLine, Plus, Tag, Trophy, Tv, type LucideIcon } from 'lucide-react';

/** Maps an achievement's icon key (kept as a plain string in the domain) to a Lucide icon. */
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  plus: Plus,
  check: Check,
  trophy: Trophy,
  pen: PenLine,
  tv: Tv,
  library: Library,
  tag: Tag,
};
