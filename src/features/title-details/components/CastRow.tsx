import { tmdbImageUrl } from '@/data/tmdb/images';
import type { CastMember } from '@/domain/types';
import { Poster } from '@/shared/ui';

/** Horizontally scrollable cast list with portraits, names, and characters. */
export function CastRow({ cast }: { cast: CastMember[] }) {
  return (
    <ul className="flex gap-4 overflow-x-auto pb-2">
      {cast.map((member) => (
        <li key={member.id} className="w-24 shrink-0">
          <Poster src={tmdbImageUrl(member.profilePath, 'w185')} alt={member.name} />
          <p className="mt-1 truncate text-sm text-text-primary">{member.name}</p>
          {member.character ? (
            <p className="truncate text-xs text-text-secondary">{member.character}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
