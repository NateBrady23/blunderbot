/**
 * Note: These interfaces to not include pagination where they may exist in the Spotify API. Add them where needed.
 *       This is not an exhaustive list of all possible Spotify API responses.
 */

interface ExternalUrls {
  spotify: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: {
    reason: string;
  };
  type: string;
  uri: string;
  artists: Artist[];
}

interface Followers {
  href: string | null;
  total: number;
}

interface TrackArtist extends Artist {
  followers: Followers;
  genres: string[];
  images: Image[];
  popularity: number;
}

interface ExternalIds {
  isrc: string;
  ean?: string;
  upc?: string;
}

interface Restrictions {
  reason: string;
}

interface SpotifyTrackInfo {
  album: Album;
  artists: TrackArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from?: object; // This could be more specifically typed based on the API documentation
  restrictions?: Restrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface TrackItem {
  album: Album;
  artists: TrackArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from?: object; // This could be more specifically typed based on the API documentation
  restrictions?: Restrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface TracksResponse {
  items: TrackItem[];
}

interface ArtistsResponse {
  items: ArtistItem[];
}

interface AlbumsResponse {
  items: AlbumItem[];
}

interface PlaylistOwner {
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

interface PlaylistItem {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: PlaylistOwner;
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
}

interface PlaylistsResponse {
  items: PlaylistItem[];
}

interface ShowItem {
  available_markets: string[];
  copyrights: {
    text: string;
    type: string;
  }[];
  description: string;
  html_description: string;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  type: string;
  uri: string;
  total_episodes: number;
}

interface ShowsResponse {
  items: ShowItem[];
}

interface EpisodeItem {
  audio_preview_url: string;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  };
  type: string;
  uri: string;
  restrictions?: Restrictions;
}

interface EpisodesResponse {
  items: EpisodeItem[];
}

interface AudiobookAuthor {
  name: string;
}

interface AudiobookNarrator {
  name: string;
}

interface AudiobookItem {
  authors: AudiobookAuthor[];
  available_markets: string[];
  copyrights: {
    text: string;
    type: string;
  }[];
  description: string;
  html_description: string;
  edition: string;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  languages: string[];
  media_type: string;
  name: string;
  narrators: AudiobookNarrator[];
  publisher: string;
  type: string;
  uri: string;
  total_chapters: number;
}

interface AudiobooksResponse {
  items: AudiobookItem[];
}

interface SpotifySearchResponse {
  tracks: TracksResponse;
  artists: ArtistsResponse;
  albums: AlbumsResponse;
  playlists: PlaylistsResponse;
  shows: ShowsResponse;
  episodes: EpisodesResponse;
  audiobooks: AudiobooksResponse;
}
