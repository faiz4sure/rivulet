import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { TopNav } from "@/components/top-nav";
import { PluginRunner } from "@/lib/plugin/runner";
import type { StreamResult, StreamLink } from "@/lib/plugin/types";
import { buildProxyUrl } from "@/lib/stream";

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Loader2 } from "lucide-react";

export function PlayerPage() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");
  const url = searchParams.get("url");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamData, setStreamData] = useState<StreamResult | null>(null);
  const [activeStream, setActiveStream] = useState<StreamLink | null>(null);

  useEffect(() => {
    if (!provider || !url) {
      setError("Missing provider or url parameters");
      setLoading(false);
      return;
    }

    const fetchStream = async () => {
      try {
        setLoading(true);
        const runner = new PluginRunner("dummy-plugin", "../dummy/index.ts");
        const result = await runner.loadLinks(provider, url);
        setStreamData(result);
        
        if (result.streams && result.streams.length > 0) {
          const highestQuality = result.streams.sort((a: StreamLink, b: StreamLink) => {
            return (b.quality || 0) - (a.quality || 0);
          })[0];
          setActiveStream(highestQuality);
        } else {
          setError("No valid streams found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load stream");
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [provider, url]);

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans flex flex-col">
      <TopNav activeProvider={provider || "movieboxProvider"} onProviderSelect={() => {}} />
      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button 
          onClick={() => navigate(-1)}
          className="self-start mb-6 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          &larr; Back
        </button>

        <div className="w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 relative flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center text-neutral-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Extracting stream sources...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center max-w-md px-4">
              <h3 className="text-xl font-bold mb-2 text-white">Playback Error</h3>
              <p>{error}</p>
            </div>
          ) : activeStream ? (
            <MediaPlayer
              src={buildProxyUrl(activeStream.url, activeStream.headers)}
              crossOrigin
              className="w-full h-full"
            >
              <MediaProvider />
              <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
          ) : null}
        </div>
        
        {streamData && streamData.streams.length > 1 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">Available Qualities</h3>
            <div className="flex flex-wrap gap-2">
              {streamData.streams.map((stream, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStream(stream)}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeStream === stream 
                      ? "bg-white text-black" 
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                  }`}
                >
                  {stream.quality ? `${stream.quality}p` : stream.title || 'Auto'}
                  {stream.isM3u8 && ' (HLS)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Component = PlayerPage;
