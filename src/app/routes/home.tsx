import { MovieList } from "@/components/movie-list";
import type { MovieCardProps } from "@/components/movie-card";

export function HomePage() {
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
    <div className="min-h-screen bg-background p-6 lg:p-10 text-foreground overflow-x-hidden">
      <div className="mb-10 px-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Rivulet</h1>
        <p className="text-muted-foreground text-lg">Initial UI</p>
      </div>
      
      <div className="space-y-12">
        <MovieList title="New Releases" movies={newReleases} />
        <MovieList title="Posters Only Mode" movies={popularWithoutText} />
        <MovieList title="From the Community" movies={newReleases.slice().reverse()} />
      </div>
    </div>
  );
}

// Necessary for react router to lazy load.
export const Component = HomePage;


