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
  isHorizontalImages?: boolean;
}

export interface HomePageResult {
  sections: HomePageSection[];
  hasNextPage?: boolean;
}

export interface ActorData {
  name: string;
  roleString?: string;
  mainActor?: boolean;
  image?: string;
}

export interface TrailerData {
  url: string;
  raw: boolean;
  headers?: Record<string, string>;
}

export interface EpisodeDetail {
  title?: string;
  url: string;
  number?: number;
  season?: number;
  seasonIndex?: number;
  posterUrl?: string;
  description?: string;
  score?: number;
  isFiller?: boolean;
  airDate?: number;
  runTime?: string | number;
}

export interface LoadResult {
  title: string;
  url: string;
  uniqueUrl?: string;
  apiName: string;
  type?: MediaType;
  posterUrl?: string;
  backgroundPosterUrl?: string;
  logoUrl?: string;
  posterHeaders?: Record<string, string>;
  year?: number;
  plot?: string;
  genres?: string[];
  score?: number;
  duration?: string | number;
  contentRating?: string;
  comingSoon?: boolean;
  actors?: ActorData[];
  trailers?: TrailerData[];
  recommendations?: SearchResult[];
  syncData?: Record<string, string>;
  episodes?: EpisodeDetail[];
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

export interface RivuletPlugin {
  getProviders(): Promise<{id: string, name: string}[]>;
  getHomePage(provider: string, page: number, request?: any): Promise<HomePageResult>;
  search(provider: string, query: string, page?: number): Promise<SearchResult[]>;
  load(provider: string, url: string): Promise<LoadResult>;
  loadLinks(provider: string, data: string): Promise<StreamResult>;
}

export interface ProviderApi {
  id: string;
  name: string;
  getHomePage(page: number, request?: any): Promise<HomePageResult>;
  search(query: string, page?: number): Promise<SearchResult[]>;
  load(url: string): Promise<LoadResult>;
  loadLinks(data: string): Promise<StreamResult>;
}
