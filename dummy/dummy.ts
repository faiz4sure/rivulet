import { DenoIo, RPCChannel } from "npm:kkrpc/deno";
import type { RivuletExtension, HomePageResult, SearchResult, LoadResult, StreamResult } from "../src/lib/plugin/types.ts";

const api: RivuletExtension = {
  async getHomePage(page: number, request?: any): Promise<HomePageResult> {
    return {
      sections: [
        {
          title: "Dummy Trending",
          items: [
            {
              title: "Dummy Movie",
              url: "dummy://movie/1",
              apiName: "DummyPlugin",
              posterUrl: "https://via.placeholder.com/150",
            }
          ]
        }
      ],
      hasNextPage: false
    };
  },
  async search(query: string, page?: number): Promise<SearchResult[]> {
    return [
      {
        title: `Result for ${query}`,
        url: "dummy://search/1",
        apiName: "DummyPlugin",
      }
    ];
  },
  async load(url: string): Promise<LoadResult> {
    return {
      title: "Dummy Movie",
      url: url,
      apiName: "DummyPlugin",
      plot: "This is a dummy plot from the dummy extension.",
    };
  },
  async loadLinks(data: string): Promise<StreamResult> {
    return {
      streams: [
        {
          title: "1080p",
          url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          isM3u8: false
        }
      ]
    };
  }
};

const io = new DenoIo(Deno.stdin.readable);
const channel = new RPCChannel(io, { expose: api });
