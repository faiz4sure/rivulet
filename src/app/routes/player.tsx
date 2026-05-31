import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { TopNav } from "@/components/top-nav";
import { PluginRunner } from "@/lib/plugin/runner";
import type { StreamResult, StreamLink } from "@/lib/plugin/types";
import { buildProxyUrl } from "@/lib/stream";
import Hls from "hls.js";

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, isHLSProvider, type MediaProviderAdapter } from '@vidstack/react';
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
        if (result && (result as any).error) {
          throw new Error((result as any).message || "Failed to extract video link");
        }
        
        setStreamData(result);
        
        if (result?.streams && result.streams.length > 0) {
          setActiveStream(result.streams[0]);
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

  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      provider.library = Hls;
      provider.config = {
        maxMaxBufferLength: 10,
        maxBufferSize: 10 * 1024 * 1024,
        capLevelToPlayerSize: true,
        maxBufferLength: 5,
        backBufferLength: 0,
        enableWorker: true,
        lowLatencyMode: false,
      };
    }
  }

  return (
    <div className="w-screen h-screen bg-black text-neutral-200 font-sans overflow-hidden flex flex-col relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-50 bg-black/50 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white transition-all flex items-center gap-2 border border-white/10 shadow-lg"
      >
        &larr; Back
      </button>
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black">
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
            src={{ 
              src: buildProxyUrl(activeStream.url, activeStream.headers), 
              type: activeStream.isM3u8 ? 'application/x-mpegurl' : 'video/mp4' 
            }}
            crossOrigin
            autoPlay
            className="w-full h-full"
            onProviderChange={onProviderChange}
          >
            <MediaProvider />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        ) : null}
      </div>
      {streamData && streamData.streams && streamData.streams.length > 1 && (
        <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2 group">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Sources
          </div>
          <div className="flex gap-2 flex-wrap justify-end max-w-sm">
            {streamData.streams.map((stream, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStream(stream)}
                className={`px-3 py-1.5 rounded-full font-medium text-xs transition-all backdrop-blur-md shadow-lg border ${
                  activeStream === stream 
                    ? "bg-white text-black border-white" 
                    : "bg-black/50 text-white/80 hover:bg-white/20 border-white/10"
                }`}
              >
                {stream.title || `Server ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const Component = PlayerPage;
