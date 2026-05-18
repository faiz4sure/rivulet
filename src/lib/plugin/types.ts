export enum MediaType {
  Movie = "Movie",
  TvSeries = "TvSeries",
  Anime = "Anime",
  Cartoon = "Cartoon",
  AsianDrama = "AsianDrama",
  Documentary = "Documentary",
  Live = "Live",
  Others = "Others"
}

export interface SearchResult {
  title: string;
  url: string;
  apiName: string;
  id?: number;
  posterUrl?: string;
  type?: MediaType;
  quality?: string;
  year?: number;
}

export interface HomePageSection {
  title: string;
  items: SearchResult[];
}

export interface HomePageResult {
  sections: HomePageSection[];
  hasNextPage?: boolean;
}

export interface EpisodeDetail {
  title?: string;
  url: string;
  number?: number;
  season?: number;
  posterUrl?: string;
  description?: string;
}

export interface LoadResult {
  title: string;
  url: string;
  apiName: string;
  posterUrl?: string;
  type?: MediaType;
  year?: number;
  plot?: string;
  genres?: string[];
  rating?: number;
  episodes?: EpisodeDetail[];
  recommendations?: SearchResult[];
}

export interface StreamLink {
  title: string;
  url: string;
  quality?: number;
  isM3u8: boolean;
  headers?: Record<string, string>;
}

export interface Subtitle {
  language: string;
  url: string;
  headers?: Record<string, string>;
}

export interface StreamResult {
  streams: StreamLink[];
  subtitles?: Subtitle[];
}

export interface RivuletExtension {
  getHomePage(provider: string, page: number, request?: any): Promise<HomePageResult>;
  search(provider: string, query: string, page?: number): Promise<SearchResult[]>;
  load(provider: string, url: string): Promise<LoadResult>;
  loadLinks(provider: string, data: string): Promise<StreamResult>;
}
