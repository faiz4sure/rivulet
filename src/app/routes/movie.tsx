import { useNavigate } from "react-router";
import { Play, Plus, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MoviePage() {
  // const { id } = useParams();
  const navigate = useNavigate();
  const movie = {
    title: "Dune: Part Two",
    posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2JGqqUT1O.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtecsmREy9O8C.jpg",
    year: "2024",
    rating: "8.8",
    duration: "2h 46m",
    genres: ["Action", "Adventure", "Sci-Fi"],
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family."
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      <div className="absolute top-0 left-0 w-full z-50 p-6 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all shadow-lg focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={movie.backdropUrl} 
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 -mt-32 md:-mt-48 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="flex flex-col justify-end pt-4 md:pt-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
            {movie.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white">{movie.rating}</span>
              </div>
            )}
            {movie.year && <span>{movie.year}</span>}
            {movie.duration && <span>{movie.duration}</span>}
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-medium">
            {movie.genres.map(genre => (
              <span key={genre} className="bg-white/10 px-3 py-1 rounded-full text-gray-200">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-gray-300 md:text-lg max-w-3xl leading-relaxed mt-4">
            {movie.description}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 gap-2 rounded-full h-12 text-base">
              <Play className="w-5 h-5 fill-current" />
              Play
            </Button>
            <Button variant="outline" size="lg" className="bg-black/40 hover:bg-black/60 border-white/20 text-white rounded-full h-12 px-6 gap-2">
              <Plus className="w-5 h-5" />
              Add to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = MoviePage;
