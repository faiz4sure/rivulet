import { useState } from "react";
import { Database } from "lucide-react";
import { MovieList } from "@/components/movie-list";
import { HeroCarousel, type HeroCarouselItem } from "@/components/hero-carousel";
import { TopNav } from "@/components/top-nav";
import type { MovieCardProps } from "@/components/movie-card";

export function HomePage() {
  const [activeProvider, setActiveProvider] = useState("None");

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
    { title: "Dune: Part Two", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2JGqqUT1O.jpg", year: "2024", rating: "8.8" },
    { title: "The Batman", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg", year: "2022", rating: "7.9" },
    { title: "Oppenheimer", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", year: "2023", rating: "8.1" },
    { title: "Interstellar", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QlsEOVSAxFewqsDq4qjhbH.jpg", year: "2014", rating: "8.6" },
    { title: "Blade Runner 2049", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", year: "2017", rating: "8.4" },
    { title: "Inception", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", year: "2010", rating: "8.8" },
    { title: "The Matrix", posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", year: "1999", rating: "8.7" },
  ];

  const popularWithoutText: MovieCardProps[] = [
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", rating: "8.5" },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: "8.4" },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7iiyA8r2T16TOr0N7H38T3TjLhN.jpg", rating: "8.0" },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", rating: "8.2" },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg", rating: "7.9" },
    { posterUrl: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1pdfLvkbY9ohJlCjQH2JGqqUT1O.jpg", rating: "8.8" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopNav activeProvider={activeProvider} onProviderSelect={setActiveProvider} />
      
      {activeProvider === "None" ? (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
          <Database className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">No Provider Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Please select a provider from the top right menu to fetch home page content.
          </p>
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
    </div>
  );
}

export const Component = HomePage;




