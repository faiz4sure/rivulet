import { Star } from "lucide-react";

export interface MovieCardProps {
  title?: string;
  posterUrl: string;
  year?: string;
  rating?: string;
  onClick?: () => void;
  isHorizontal?: boolean;
}

export function MovieCard({ title, posterUrl, year, rating, onClick, isHorizontal }: MovieCardProps) {
  const hasTextContext = title || year;

  return (
    <div 
      className={`group relative flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-card transition-all hover:bg-accent/10 hover:ring-1 hover:ring-primary/30 ${isHorizontal ? "w-72" : "w-48"}`}
      onClick={onClick}
    >
      <div className={`relative w-full overflow-hidden bg-muted ${isHorizontal ? "aspect-video" : "aspect-[2/3]"}`}>
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title || "Movie poster"} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-sm">
            No Image
          </div>
        )}

        {rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Star className="h-3 w-3 text-gray-300" fill="currentColor" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      {hasTextContext && (
        <div className="flex flex-col p-3">
          {title && (
            <h3 className="line-clamp-1 text-sm font-medium text-foreground" title={title}>
              {title}
            </h3>
          )}
          {year && (
            <span className="mt-0.5 text-xs text-muted-foreground">{year}</span>
          )}
        </div>
      )}
    </div>
  );
}

