import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Play, Plus, ArrowLeft, Star, Film, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PluginRunner } from "@/lib/plugin/runner";
import type { LoadResult } from "@/lib/plugin/types";

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
          <>
            <img 
              src={data.backgroundPosterUrl} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40 blur-3xl scale-125"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex justify-end">
              <div className="relative w-full h-full lg:w-[80%]">
                <img 
                  src={data.backgroundPosterUrl} 
                  alt={data.title}
                  className="w-full h-full object-contain object-right object-top"
                />
                <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-background via-background/90 to-transparent" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
      </div>


      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 h-fit">
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
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
              {data.score !== undefined && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-white">{data.score.toFixed(1)}</span>
                </div>
              )}
              {data.year && <span>{data.year}</span>}
              {data.contentRating && (
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs text-gray-400">
                  {data.contentRating}
                </span>
              )}
              {data.duration && <span>{data.duration} min</span>}
              {data.type && (
                <span className="flex items-center gap-1 text-gray-400">
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
              <p className="text-gray-300 md:text-lg max-w-3xl leading-relaxed mt-4">
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
          {data.actors && data.actors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Cast</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {data.actors.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-shrink-0 w-24">
                    <div className="w-20 h-20 rounded-full bg-gray-800 border border-gray-700 overflow-hidden mb-3 shadow-lg">
                      {actor.image ? (
                        <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg text-center bg-gray-900 font-semibold uppercase">
                          {actor.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-200 text-center line-clamp-2">{actor.name}</span>
                    {actor.roleString && (
                      <span className="text-xs text-gray-500 text-center line-clamp-1 mt-1">{actor.roleString}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    <select 
                      className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-2 text-white outline-none focus:ring-1 focus:ring-white/30 cursor-pointer shadow-lg"
                      value={selectedRange}
                      onChange={(e) => setSelectedRange(Number(e.target.value))}
                    >
                      {episodeRanges.map(range => (
                        <option key={range.index} value={range.index}>
                          Episodes {range.start}-{range.end}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {seasons.length > 1 && (
                    <select 
                      className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-2 text-white outline-none focus:ring-1 focus:ring-white/30 cursor-pointer shadow-lg"
                      value={selectedSeason || seasons[0]}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    >
                      {seasons.map(s => (
                        <option key={s} value={s}>Season {s}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedEpisodes.map((ep, idx) => (
                  <div 
                    key={idx} 
                    className="group flex gap-4 bg-gray-900/40 hover:bg-gray-800 p-3 rounded-xl border border-gray-800/50 cursor-pointer transition-all hover:shadow-xl hover:border-gray-700"
                  >
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                      <img 
                        src={ep.posterUrl || data.backgroundPosterUrl || data.posterUrl || "https://placehold.co/1280x720/png"} 
                        alt={ep.title || `Episode ${ep.number}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 rounded-full p-2.5 backdrop-blur-md">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-200 truncate">
                        {ep.number ? `${ep.number}. ` : ""}{ep.title || `Episode ${ep.number}`}
                      </h4>
                      {ep.runTime && (
                        <span className="text-xs font-medium text-gray-500 mt-1">{ep.runTime} min</span>
                      )}
                      {ep.description && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{ep.description}</p>
                      )}
                    </div>
                  </div>
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
