import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard, type MovieCardProps } from "./movie-card";

interface MovieListProps {
  title: string;
  movies: MovieCardProps[];
}

export function MovieList({ title, movies }: MovieListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground transition-all hover:bg-secondary hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground transition-all hover:bg-secondary hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 snap-x"
      >
        {movies.map((movie, index) => (
          <div key={index} className="snap-start shrink-0">
            <MovieCard {...movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
