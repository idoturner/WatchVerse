import { useTagsStore } from '@/stores/tagsStore';

/** Small read-only tag chips for library cards/rows. */
export function EntryTagChips({ tagIds, max = 2 }: { tagIds: string[]; max?: number }) {
  const tagsById = useTagsStore((s) => s.items);
  const names = tagIds.map((id) => tagsById[id]?.name).filter((n): n is string => Boolean(n));
  if (names.length === 0) return null;

  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {shown.map((name) => (
        <span
          key={name}
          className="truncate rounded-full bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-secondary"
        >
          {name}
        </span>
      ))}
      {extra > 0 ? <span className="text-[10px] text-text-tertiary">+{extra}</span> : null}
    </div>
  );
}
