import { useState, useEffect, useCallback } from "react";
import { Play, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HeroCarouselItem {
  id: string | number;
  title: string;
  backdropUrl: string;
  tags?: string[];
  description?: string;
}

interface HeroCarouselProps {
  items: HeroCarouselItem[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ items, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [items.length, autoPlayInterval, goToNext]);

  if (!items.length) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="group relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-muted">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={item.backdropUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-background/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-30 flex flex-col justify-end px-10 pb-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
            {currentItem.title}
          </h1>
          
          {currentItem.tags && (
            <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-300">
              {currentItem.tags.map((tag, idx) => (
                <span key={idx} className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {currentItem.description && (
            <p className="text-gray-200 line-clamp-3 md:line-clamp-2 text-sm md:text-base drop-shadow-md">
              {currentItem.description}
            </p>
          )}
          <div className="flex items-center gap-6 pt-4">
            <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors">
              <Plus className="w-6 h-6" />
              <span className="text-xs font-semibold uppercase tracking-wider">List</span>
            </button>

            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 gap-2 rounded-full h-12 text-base">
              <Play className="w-5 h-5 fill-current" />
              Play
            </Button>

            <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors">
              <Info className="w-6 h-6" />
              <span className="text-xs font-semibold uppercase tracking-wider">Info</span>
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-10 z-30 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
