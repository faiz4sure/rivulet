import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Play, Plus, ArrowLeft, Star, Film, MonitorPlay, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PluginRunner } from "@/lib/plugin/runner";
import type { LoadResult } from "@/lib/plugin/types";
import { CastList } from "@/components/cast-list";
import { EpisodeCard } from "@/components/episode-card";

function CustomSelect({ value, onChange, options }: { 
  value: number, 
  onChange: (val: number) => void, 
  options: { label: string, value: number }[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || "";

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 text-sm rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-white/30 cursor-pointer shadow-lg backdrop-blur-md transition-all font-medium min-w-[140px] justify-between"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 min-w-[160px] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {options.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value ? "bg-white/20 text-white font-medium" : "text-neutral-300 hover:bg-white/10 hover:text-white"}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MoviePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const apiName = searchParams.get("apiName") || "movieboxProvider";
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoadResult | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const runner = new PluginRunner("dummy-plugin", "../dummy/index.ts");
        const result = await runner.load(apiName, url!);
        setData(result);
        if (result.episodes && result.episodes.length > 0) {
          const firstSeason = result.episodes.find(ep => ep.season !== undefined)?.season || 1;
          setSelectedSeason(firstSeason);
        }
      } catch (err) {
        console.error("Failed to load details:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url, apiName]);

  const [selectedRange, setSelectedRange] = useState<number>(0);
  useEffect(() => {
    setSelectedRange(0);
  }, [selectedSeason]);

  const seasons = useMemo(() => {
    if (!data?.episodes) return [];
    const s = new Set<number>();
    data.episodes.forEach(ep => {
      if (ep.season !== undefined) s.add(ep.season);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [data?.episodes]);

  const allEpisodesForSeason = useMemo(() => {
    if (!data?.episodes) return [];
    if (selectedSeason === null) return data.episodes;
    return data.episodes.filter(ep => (ep.season || 1) === selectedSeason);
  }, [data?.episodes, selectedSeason]);

  const CHUNK_SIZE = 10;
  const episodeRanges = useMemo(() => {
    const ranges = [];
    for (let i = 0; i < allEpisodesForSeason.length; i += CHUNK_SIZE) {
      ranges.push({
        index: i,
        start: i + 1,
        end: Math.min(i + CHUNK_SIZE, allEpisodesForSeason.length)
      });
    }
    return ranges;
  }, [allEpisodesForSeason]);

  const displayedEpisodes = useMemo(() => {
    return allEpisodesForSeason.slice(selectedRange, selectedRange + CHUNK_SIZE);
  }, [allEpisodesForSeason, selectedRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Content</h2>
        <p className="text-gray-400">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

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


      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-muted">
        {data.backgroundPosterUrl ? (
          <img 
            src={data.backgroundPosterUrl} 
            alt={data.title}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/80 via-transparent to-transparent pointer-events-none" />
      </div>


      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-10 -mt-20 md:-mt-40">
        <div className="flex flex-col md:flex-row gap-8 bg-black/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 h-fit">
            <img 
              src={data.posterUrl || "https://placehold.co/600x900/png"} 
              alt={data.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex flex-col justify-end pt-4 md:pt-16 space-y-4 flex-1">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.title} className="max-h-24 md:max-h-32 object-contain object-left drop-shadow-2xl" />
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{data.title}</h1>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-300">
              {data.score !== undefined && (
                <div className="flex items-center gap-1 text-neutral-300">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-white">{data.score.toFixed(1)}</span>
                </div>
              )}
              {data.year && <span>{data.year}</span>}
              {data.contentRating && (
                <span className="border border-neutral-600 px-1.5 py-0.5 rounded text-xs text-neutral-400">
                  {data.contentRating}
                </span>
              )}
              {data.type === "Movie" && data.duration && <span>{data.duration}</span>}
              {data.type && (
                <span className="flex items-center gap-1 text-neutral-400">
                  {data.type === "Movie" ? <Film className="w-4 h-4" /> : <MonitorPlay className="w-4 h-4" />}
                  {data.type}
                </span>
              )}
            </div>

            {data.genres && data.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                {data.genres.map(genre => (
                  <span key={genre} className="bg-white/10 px-3 py-1 rounded-full text-gray-200">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {data.plot && (
              <p className="text-neutral-300 md:text-lg max-w-3xl leading-relaxed mt-4">
                {data.plot}
              </p>
            )}

            <div className="flex items-center gap-4 mt-8">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 gap-2 rounded-full h-12 text-base">
                <Play className="w-5 h-5 fill-current" />
                Play First
              </Button>
              <Button variant="outline" size="lg" className="bg-black/40 hover:bg-black/60 border-white/20 text-white rounded-full h-12 px-6 gap-2">
                <Plus className="w-5 h-5" />
                Add to List
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-16">
          <CastList actors={data.actors || []} />

          {data.type === "TvSeries" && displayedEpisodes.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                  Episodes
                  <span className="bg-white/10 text-sm font-medium px-3 py-1 rounded-full text-gray-300">
                    {data.episodes?.length || 0} Total
                  </span>
                </h3>
                
                <div className="flex items-center gap-3">
                  {episodeRanges.length > 1 && (
                    <CustomSelect
                      value={selectedRange}
                      onChange={setSelectedRange}
                      options={episodeRanges.map(range => ({
                        label: `Episodes ${range.start}-${range.end}`,
                        value: range.index
                      }))}
                    />
                  )}
                  
                  {seasons.length > 1 && (
                    <CustomSelect
                      value={selectedSeason || seasons[0]}
                      onChange={setSelectedSeason}
                      options={seasons.map(s => ({
                        label: `Season ${s}`,
                        value: s
                      }))}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayedEpisodes.map((ep, idx) => (
                  <EpisodeCard 
                    key={idx} 
                    episode={ep} 
                    fallbackPosterUrl={data.backgroundPosterUrl || data.posterUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Component = MoviePage;
