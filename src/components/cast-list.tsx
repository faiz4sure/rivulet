import type { ActorData } from "@/lib/plugin/types";

interface CastListProps {
  actors: ActorData[];
}

export function CastList({ actors }: CastListProps) {
  if (!actors || actors.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Cast</h3>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {actors.map((actor, idx) => (
          <div key={idx} className="flex flex-col items-center flex-shrink-0 w-24">
            <div className="w-20 h-20 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden mb-3 shadow-lg">
              {actor.image ? (
                <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-lg text-center bg-neutral-900 font-semibold uppercase">
                  {actor.name.substring(0, 2)}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-neutral-200 text-center line-clamp-2">{actor.name}</span>
            {actor.roleString && (
              <span className="text-xs text-neutral-500 text-center line-clamp-1 mt-1">{actor.roleString}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
