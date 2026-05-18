import { useEffect, useState } from "react";
import { Server } from "lucide-react";
import { useNavigate } from "react-router";
import { MovieList } from "@/components/movie-list";
import { HeroCarousel, type HeroCarouselItem } from "@/components/hero-carousel";
import { TopNav } from "@/components/top-nav";
import type { MovieCardProps } from "@/components/movie-card";
import { PluginRunner } from "@/lib/plugin/runner";
import type { HomePageResult } from "@/lib/plugin/types";

export function HomePage() {
  const [activeProvider, setActiveProvider] = useState("None");
  const [pluginData, setPluginData] = useState<HomePageResult | null>(null);
  const [pluginError, setPluginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (activeProvider === "None") {
        setPluginData(null);
        return;
      }
      
      if (activeProvider === "dummyProvider") {
        setIsLoading(true);
        setPluginError(null);
        setPluginData(null);
        try {
          const runner = new PluginRunner("dummy-plugin", "../dummy/index.ts");
          
          await runner.installDependencies();
          
          const result = await runner.getHomePage("dummyProvider", 1);
          
          setPluginData(result);
        } catch (err) {
          console.error("plugin failed to execute", err);
          setPluginError(String(err));
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadData();
  }, [activeProvider]);

  const handleMovieClick = () => {
    navigate("/movie/1");
  };

  const heroMovies: HeroCarouselItem[] = [
    { 
      id: "1", 
      title: "Dune: Part Two", 
      backdropUrl: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtecsmREy9O8C.jpg",
      tags: ["Action", "Adventure", "Sci-Fi"],
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family."
    },
    { 
      id: "2", 
      title: "The Batman", 
      backdropUrl: "https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRp3ew96Yot.jpg",
      tags: ["Crime", "Mystery", "Thriller"],
      description: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler."
    },
    { 
      id: "3", 
      title: "Oppenheimer", 
      backdropUrl: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      tags: ["Drama", "History"],
      description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II."
    }
  ];

  const newReleases: MovieCardProps[] = [
    { title: "Dune: Part Two", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2JGqqUT1O.jpg", year: "2024", rating: "8.8", onClick: handleMovieClick },
    { title: "The Batman", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg", year: "2022", rating: "7.9", onClick: handleMovieClick },
    { title: "Oppenheimer", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", year: "2023", rating: "8.1", onClick: handleMovieClick },
    { title: "Interstellar", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QlsEOVSAxFewqsDq4qjhbH.jpg", year: "2014", rating: "8.6", onClick: handleMovieClick },
    { title: "Blade Runner 2049", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", year: "2017", rating: "8.4", onClick: handleMovieClick },
    { title: "Inception", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", year: "2010", rating: "8.8", onClick: handleMovieClick },
    { title: "The Matrix", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", year: "1999", rating: "8.7", onClick: handleMovieClick },
  ];

  const popularWithoutText: MovieCardProps[] = [
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", rating: "8.5", onClick: handleMovieClick },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: "8.4", onClick: handleMovieClick },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7iiyA8r2T16TOr0N7H38T3TjLhN.jpg", rating: "8.0", onClick: handleMovieClick },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", rating: "8.2", onClick: handleMovieClick },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg", rating: "7.9", onClick: handleMovieClick },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2JGqqUT1O.jpg", rating: "8.8", onClick: handleMovieClick },
  ];

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopNav activeProvider={activeProvider} onProviderSelect={setActiveProvider} />
      
      {activeProvider === "None" ? (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
          <Server className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">No Provider Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select a provider from the top right menu to fetch home page content.
          </p>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-screen text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              Loading dummy plugin process...
            </div>
          ) : pluginError ? (
            <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-2xl">
                <h3 className="text-xl font-bold text-red-400 mb-2">Plugin Execution Failed</h3>
                <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap text-left break-all">
                  {pluginError}
                </p>
                <p className="mt-4 text-sm text-gray-400">
                  Tip: Press F12 to open the Developer Tools console for more details.
                </p>
              </div>
            </div>
          ) : pluginData ? (
            <div className="p-6 lg:p-10 relative z-40 space-y-12 pb-10 pt-24">
              {pluginData.sections.map((section, idx) => (
                <MovieList 
                  key={idx} 
                  title={section.title} 
                  movies={section.items.map(item => ({
                    title: item.title,
                    posterUrl: item.posterUrl || "https://via.placeholder.com/600x900",
                    year: item.year?.toString(),
                    rating: item.quality,
                    onClick: handleMovieClick
                  }))} 
                />
              ))}
            </div>
          ) : (
            <>
              <HeroCarousel items={heroMovies} />
              
              <div className="p-6 lg:p-10 -mt-10 relative z-40 space-y-12 pb-10">
                <MovieList title={`${activeProvider} New Releases`} movies={newReleases} />
                <MovieList title="Posters Only Mode" movies={popularWithoutText} />
                <MovieList title="From the Community" movies={newReleases.slice().reverse()} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export const Component = HomePage;




