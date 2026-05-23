import { useEffect, useState } from "react";
import { Server } from "lucide-react";
import { useNavigate } from "react-router";
import { MovieList } from "@/components/movie-list";
import { HeroCarousel, type HeroCarouselItem } from "@/components/hero-carousel";
import { TopNav } from "@/components/top-nav";

import { PluginRunner } from "@/lib/plugin/runner";
import type { HomePageResult } from "@/lib/plugin/types";

export function HomePage() {
  const [activeProvider, setActiveProvider] = useState("movieboxProvider");
  const [pluginData, setPluginData] = useState<HomePageResult | null>(null);
  const [heroItems, setHeroItems] = useState<HeroCarouselItem[]>([]);
  const [pluginError, setPluginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (activeProvider === "None") {
        setPluginData(null);
        return;
      }
      
      setIsLoading(true);
      setPluginError(null);
      setPluginData(null);
      try {
        const runner = new PluginRunner("dummy-plugin", "../dummy/index.ts");
        await runner.installDependencies();
        
        const result = await runner.getHomePage(activeProvider, 1);
        setPluginData(result);
        if (result.sections && result.sections.length > 0 && result.sections[0].items.length > 0) {
          const shuffled = [...result.sections[0].items].sort(() => 0.5 - Math.random());
          const topItems = shuffled.slice(0, 3);
          const loadedHeroes = await Promise.all(
            topItems.map(async (item) => {
              const details = await runner.load(activeProvider, item.url);
                return {
                  id: details.url,
                  title: details.title,
                  backdropUrl: details.backgroundPosterUrl || details.posterUrl || "https://placehold.co/1280x720/png",
                  logoUrl: details.logoUrl, 
                  tags: [details.year?.toString() || "2024", `Score: ${details.score || "N/A"}`],
                  description: details.plot
                } as HeroCarouselItem;
              })
            );
            setHeroItems(loadedHeroes);
          }
      } catch (err) {
        console.error("plugin failed to execute", err);
        setPluginError(String(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeProvider]);

  const handleMovieClick = (url: string, apiName: string) => {
    navigate(`/movie?url=${encodeURIComponent(url)}&apiName=${encodeURIComponent(apiName)}`);
  };



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
              {heroItems.length > 0 && (
                <div className="-mx-6 lg:-mx-10 -mt-24 mb-10">
                  <HeroCarousel items={heroItems} />
                </div>
              )}
              {pluginData.sections.map((section, idx) => (
                <MovieList 
                  key={idx} 
                  title={section.title} 
                  movies={section.items.map(item => ({
                    title: item.title,
                    posterUrl: item.posterUrl || (section.isHorizontalImages ? "https://placehold.co/900x600/png" : "https://placehold.co/600x900/png"),
                    year: item.year?.toString(),
                    rating: item.quality,
                    onClick: () => handleMovieClick(item.url, item.apiName || activeProvider),
                    isHorizontal: section.isHorizontalImages
                  }))} 
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export const Component = HomePage;




