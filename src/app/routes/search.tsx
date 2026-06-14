import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { TopNav } from "@/components/top-nav";
import { MovieList } from "@/components/movie-list";
import { PluginRunner } from "@/lib/plugin/runner";
import type { SearchResult } from "@/lib/plugin/types";
import { Search, Server } from "lucide-react";
import { getInstalledPlugins, getPluginEntryPath, type InstalledPlugin } from "@/lib/plugin/manager";

interface ProviderResult {
  provider: string;
  providerName: string;
  results: SearchResult[] | null;
  error?: string;
  loading: boolean;
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();
  const [activeProvider, setActiveProvider] = useState("");
  const [providerResults, setProviderResults] = useState<ProviderResult[]>([]);

  useEffect(() => {
    if (!query) return;

    async function searchAll() {
      const plugins = await getInstalledPlugins();
      
    
      const providerEntries: { provider: string; providerName: string; plugin: InstalledPlugin }[] = [];
      for (const plugin of plugins) {
        for (const prov of plugin.providers) {
          if (prov.enabled !== false) {
            providerEntries.push({ provider: prov.id, providerName: prov.name, plugin });
          }
        }
      }

      if (!activeProvider && providerEntries.length > 0) {
        setActiveProvider(providerEntries[0].provider);
      }

    
      setProviderResults(providerEntries.map(pe => ({
        provider: pe.provider,
        providerName: pe.providerName,
        results: null,
        loading: true,
      })));

      
      for (const pe of providerEntries) {
        (async () => {
          try {
            const entryPath = await getPluginEntryPath(pe.plugin);
            const runner = new PluginRunner(pe.plugin.id, entryPath);
            
            const results = await runner.search(pe.provider, query, 1);
            if ((results as any).error) {
              throw new Error((results as any).message || "Unknown error");
            }

            setProviderResults(prev => prev.map(p =>
              p.provider === pe.provider ? { ...p, results, loading: false } : p
            ));
          } catch (err) {
            setProviderResults(prev => prev.map(p =>
              p.provider === pe.provider ? { ...p, error: String(err), loading: false } : p
            ));
          }
        })();
      }
    }

    searchAll();
  }, [query]);

  const handleMovieClick = (url: string, apiName: string) => {
    navigate(`/movie?url=${encodeURIComponent(url)}&apiName=${encodeURIComponent(apiName)}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopNav activeProvider={activeProvider} onProviderSelect={setActiveProvider} />
      
      <div className="p-6 lg:p-10 pt-24 max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex items-center gap-4">
          <Search className="w-8 h-8 text-neutral-400" />
          <h1 className="text-3xl font-bold">Search results for "{query}"</h1>
        </div>

        {providerResults.map((pr) => (
          <div key={pr.provider} className="space-y-4 bg-neutral-900/20 p-6 rounded-3xl border border-neutral-800/60 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Server className="w-5 h-5 text-neutral-400" />
              <h2 className="text-2xl font-semibold text-white">{pr.providerName}</h2>
              {pr.loading && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm text-neutral-400">Searching...</span>
                </div>
              )}
            </div>
            
            {pr.error && (
              <div className="mx-2 text-red-400 text-sm bg-red-900/20 p-4 rounded-xl border border-red-900/50">
                Failed to search: {pr.error}
              </div>
            )}
            
            {!pr.loading && !pr.error && pr.results && pr.results.length === 0 && (
              <div className="mx-2 text-neutral-500 py-4">No results found.</div>
            )}
            
            {pr.results && pr.results.length > 0 && (
              <MovieList 
                title="" 
                movies={pr.results.map(item => ({
                  title: item.title,
                  posterUrl: item.posterUrl || "https://placehold.co/600x900/png",
                  year: item.year?.toString(),
                  rating: item.quality,
                  onClick: () => handleMovieClick(item.url, item.apiName || pr.provider)
                }))} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const Component = SearchPage;
