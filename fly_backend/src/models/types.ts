export interface Airport {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  elevation_ft: number;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

export interface AirportDocument {
  id: string;
  iata_code: string;
  icao_code: string;
  name: string;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  continent: string;
  latitude: number;
  longitude: number;
  city_code: string | null;
  type: "airport";
  aliases: string[];
  translations: Record<string, string>;
  search_text: string;
  popularity_score: number;
  keywords: string[];
}

export interface CityDocument {
  id: string;
  city_code: string;
  name: string;
  country: string;
  country_code: string;
  airports: { iata: string; name: string }[];
  airport_count: number;
  type: "city";
  aliases: string[];
  translations: Record<string, string>;
  search_text: string;
  popularity_score: number;
}

export interface RegionDocument {
  id: string;
  name: string;
  country: string;
  country_code: string;
  airports: { iata: string; name: string }[];
  airport_count: number;
  type: "region";
  aliases: string[];
  translations: Record<string, string>;
  search_text: string;
  popularity_score: number;
}

export type SearchResult = AirportDocument | CityDocument | RegionDocument;
