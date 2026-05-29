import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';
import { Airport, AirportDocument, CityDocument, RegionDocument } from '../src/models/types.js';

dotenv.config();

const client = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = process.cwd();
const DATA_DIR = path.join(rootDir, 'data/raw');
const ENRICH_DIR = path.join(rootDir, 'data');

// Load enrichment data
const multiAirportCities = JSON.parse(fs.readFileSync(path.join(ENRICH_DIR, 'multi_airport_cities.json'), 'utf-8'));
const tourismAliases = JSON.parse(fs.readFileSync(path.join(ENRICH_DIR, 'tourism_aliases.json'), 'utf-8'));
const cityOverrides = JSON.parse(fs.readFileSync(path.join(ENRICH_DIR, 'city_overrides.json'), 'utf-8'));
const translations = JSON.parse(fs.readFileSync(path.join(ENRICH_DIR, 'translations.json'), 'utf-8'));

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function seed() {
  try {
    console.log('Starting seed process...');

    // Check if data files exist
    const filesToCheck = ['airports.csv', 'regions.csv', 'countries.csv'];
    for (const f of filesToCheck) {
      if (!fs.existsSync(path.join(DATA_DIR, f))) {
        throw new Error(`Data file missing: ${f}`);
      }
    }

    // 1. Load raw data
    console.log('Loading CSVs...');
    const airportsRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'airports.csv'), 'utf-8'), { columns: true, skip_empty_lines: true }) as Airport[];
    const regionsRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'regions.csv'), 'utf-8'), { columns: true, skip_empty_lines: true });
    const countriesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'countries.csv'), 'utf-8'), { columns: true, skip_empty_lines: true });

    const regionsMap = new Map(regionsRaw.map((r: any) => [r.code, r.name]));
    const countriesMap = new Map(countriesRaw.map((c: any) => [c.code, c.name]));

    // 2. Filter & Process Airports
    console.log(`Processing ${airportsRaw.length} airports...`);
    const processedAirports: AirportDocument[] = [];
    const airportMap = new Map<string, AirportDocument>();

    for (const a of airportsRaw) {
      // Filter junk (only commercial airports)
      if (a.scheduled_service !== 'yes' || !['large_airport', 'medium_airport'].includes(a.type)) {
        continue;
      }

      if (!a.iata_code) continue;

      const countryName = countriesMap.get(a.iso_country) || a.iso_country;
      const regionName = regionsMap.get(a.iso_region) || a.iso_region;

      const doc: AirportDocument = {
        id: `airport_${a.iata_code}`,
        iata_code: a.iata_code,
        icao_code: a.ident,
        name: a.name,
        city: a.municipality,
        state_province: regionName,
        country: countryName,
        country_code: a.iso_country,
        continent: a.continent,
        latitude: parseFloat(a.latitude_deg.toString()),
        longitude: parseFloat(a.longitude_deg.toString()),
        city_code: null,
        type: 'airport',
        aliases: [a.iata_code, a.name, a.municipality].filter(Boolean),
        translations: translations[a.iata_code] || {},
        search_text: normalize(`${a.name} ${a.municipality} ${a.iata_code} ${regionName} ${countryName}`),
        popularity_score: a.type === 'large_airport' ? 100 : 50,
        keywords: a.keywords ? a.keywords.split(',').map(k => k.trim()) : []
      };

      for (const [alias, codes] of Object.entries(tourismAliases)) {
        if ((codes as string[]).includes(a.iata_code)) {
          doc.aliases.push(alias);
        }
      }

      for (const [cityName, codes] of Object.entries(cityOverrides)) {
        if ((codes as string[]).includes(a.iata_code)) {
          doc.aliases.push(cityName);
        }
      }

      processedAirports.push(doc);
      airportMap.set(a.iata_code, doc);
    }
    console.log(`Processed ${processedAirports.length} commercial airports.`);

    // 3. Process Cities (Multi-airport)
    console.log('Processing cities...');
    const processedCities: CityDocument[] = [];
    for (const [cityCode, iataCodes] of Object.entries(multiAirportCities)) {
      const cityAirports = (iataCodes as string[]).map(code => {
        const air = airportMap.get(code);
        if (air) air.city_code = cityCode;
        return air ? { iata: air.iata_code, name: air.name } : null;
      }).filter(Boolean) as { iata: string, name: string }[];

      if (cityAirports.length === 0) continue;

      const refAirport = airportMap.get((iataCodes as string[])[0]);
      if (!refAirport) continue;

      processedCities.push({
        id: `city_${cityCode}`,
        city_code: cityCode,
        name: refAirport.city,
        country: refAirport.country,
        country_code: refAirport.country_code,
        airports: cityAirports,
        airport_count: cityAirports.length,
        type: 'city',
        aliases: [cityCode, refAirport.city],
        translations: {},
        search_text: normalize(`${refAirport.city} ${cityCode} ${refAirport.country}`),
        popularity_score: 200
      });
    }

    // 4. Process Regions (States/Provinces)
    console.log('Processing regions...');
    const processedRegions: RegionDocument[] = [];
    const regionsAirportsMap = new Map<string, { iata: string, name: string }[]>();
    for (const a of processedAirports) {
      const key = `${a.country_code}-${a.state_province}`;
      if (!regionsAirportsMap.has(key)) regionsAirportsMap.set(key, []);
      regionsAirportsMap.get(key)!.push({ iata: a.iata_code, name: a.name });
    }

    for (const [key, airports] of regionsAirportsMap.entries()) {
      const regionName = key.split('-')[1];
      if (airports.length < 3 && !['Hawaii', 'Ontario', 'Bali', 'Goa'].includes(regionName)) continue;
      
      const countryCode = key.split('-')[0];
      const countryName = countriesMap.get(countryCode) || countryCode;

      processedRegions.push({
        id: `region_${key}`,
        name: regionName,
        country: countryName,
        country_code: countryCode,
        airports: airports,
        airport_count: airports.length,
        type: 'region',
        aliases: [regionName],
        translations: {},
        search_text: normalize(`${regionName} ${countryName}`),
        popularity_score: 30
      });
    }
    console.log(`Processed ${processedRegions.length} regions.`);

    // 5. Seed Meilisearch
    console.log('Connecting to Meilisearch...');
    
    const setupIndex = async (uid: string, settings: any) => {
      console.log(`Setting up index: ${uid}...`);
      const index = client.index(uid);
      await client.createIndex(uid, { primaryKey: 'id' }).catch(() => {});
      await index.updateSettings(settings);
      return index;
    };

    const commonSettings = {
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness', 'popularity_score:desc'],
      sortableAttributes: ['popularity_score'],
      typoTolerance: { minWordSizeForTypos: { oneTypo: 3, twoTypos: 7 } }
    };

    const airportsIndex = await setupIndex('airports', {
      ...commonSettings,
      searchableAttributes: ['iata_code', 'name', 'city', 'aliases', 'translations', 'state_province', 'country', 'search_text']
    });

    const citiesIndex = await setupIndex('cities', {
      ...commonSettings,
      searchableAttributes: ['city_code', 'name', 'aliases', 'search_text']
    });

    const regionsIndex = await setupIndex('regions', {
      ...commonSettings,
      searchableAttributes: ['name', 'aliases', 'search_text']
    });

    console.log('Sending documents to Meilisearch...');
    await Promise.all([
      airportsIndex.addDocuments(processedAirports),
      citiesIndex.addDocuments(processedCities),
      regionsIndex.addDocuments(processedRegions)
    ]);

    console.log('Seed complete!');
  } catch (error) {
    console.error('SEED ERROR:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
