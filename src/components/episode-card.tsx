import { Play, Info } from "lucide-react";
import type { EpisodeDetail } from "@/lib/plugin/types";

interface EpisodeCardProps {
  episode: EpisodeDetail;
  fallbackPosterUrl?: string;
  onClick?: () => void;
}

export function EpisodeCard({ episode, fallbackPosterUrl, onClick }: EpisodeCardProps) {
  const poster = episode.posterUrl || fallbackPosterUrl || "https://placehold.co/1280x720/png";
  const title = episode.title || `Episode ${episode.number}`;

  return (
    <div 
      className="group flex flex-col gap-3 bg-neutral-900/40 hover:bg-neutral-800 p-4 rounded-xl border border-neutral-800/50 cursor-pointer transition-colors hover:border-neutral-700 relative"
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className="relative w-32 h-20 md:w-40 md:h-24 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
          <img 
            src={poster} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 rounded-full p-2 backdrop-blur-md">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-neutral-200 line-clamp-2">
            {episode.number ? `${episode.number}. ` : ""}{title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-medium text-neutral-500">
            {episode.score !== undefined && (
              <span className="flex items-center text-neutral-400">
                ⭐ {episode.score.toFixed(1)}
              </span>
            )}
            {episode.runTime && (
              <span>{episode.runTime}</span>
            )}
            {episode.airDate && (
              <span>{new Date(episode.airDate).toLocaleDateString()}</span>
            )}
          </div>
          {episode.isFiller !== undefined && (
            <div className="absolute top-4 right-4 flex items-center justify-center group/tooltip">
              <Info className={`w-4 h-4 ${episode.isFiller ? "text-white" : "text-neutral-500"}`} />
              <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block w-max bg-neutral-800 text-xs text-white px-2 py-1 rounded shadow-lg">
                {episode.isFiller ? "Filler Episode" : "Canon Episode"}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {episode.description && (
        <p className="text-xs md:text-sm text-neutral-400 line-clamp-3 leading-relaxed pt-2">
          {episode.description}
        </p>
      )}
    </div>
  );
}
