import { Injectable } from '@nestjs/common';
import { JUDETE } from '../common/data/judete';

import { XMLParser } from 'fast-xml-parser';
import { stripDiacritics } from '../common/data/judete';

export interface ZoneWeather {
  zoneName: string;
  temperature: number;
  weatherCode: number;
  description: string;
  isSevere: boolean;
}

interface CacheEntry {
  data: ZoneWeather;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Cer senin',
  1: 'Predominant senin',
  2: 'Partial noros',
  3: 'Noros',
  45: 'Ceata',
  48: 'Ceata cu depuneri de gheata',
  51: 'Burnita slaba',
  53: 'Burnita moderata',
  55: 'Burnita intensa',
  61: 'Ploaie slaba',
  63: 'Ploaie moderata',
  65: 'Ploaie puternica',
  71: 'Ninsoare slaba',
  73: 'Ninsoare moderata',
  75: 'Ninsoare abundenta',
  80: 'Averse slabe',
  81: 'Averse moderate',
  82: 'Averse violente',
  95: 'Furtuna',
  96: 'Furtuna cu grindina',
  99: 'Furtuna violenta cu grindina',
};

const SEVERE_CODES = new Set([65, 75, 82, 95, 96, 99]);

@Injectable()
export class WeatherService {
  private cache = new Map<string, CacheEntry>();

  async getWeatherForZones(zoneNames: string[]): Promise<ZoneWeather[]> {
    const unique = [...new Set(zoneNames)];
    const results = await Promise.all(
      unique.map((zoneName) => this.getWeatherForZone(zoneName)),
    );
    return results.filter((r): r is ZoneWeather => r !== null);
  }

  private async getWeatherForZone(
    zoneName: string,
  ): Promise<ZoneWeather | null> {
    const judet = JUDETE.find((j) => j.name === zoneName);
    if (!judet) {
      return null;
    }

    const cached = this.cache.get(zoneName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${judet.lat}&longitude=${judet.lng}` +
      `&current=temperature_2m,weather_code&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      return cached?.data ?? null;
    }

    const json = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };

    const weatherCode = json.current?.weather_code ?? 0;
    const data: ZoneWeather = {
      zoneName: judet.name,
      temperature: json.current?.temperature_2m ?? 0,
      weatherCode,
      description: WEATHER_CODE_DESCRIPTIONS[weatherCode] ?? 'Necunoscut',
      isSevere: SEVERE_CODES.has(weatherCode),
    };

    this.cache.set(zoneName, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  }

    private warningsCache: { data: Map<string, WeatherWarning[]>; expiresAt: number } | null = null;
  private readonly WARNINGS_FEED_URL =
    'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-romania';
  private readonly WARNINGS_CACHE_TTL_MS = 15 * 60 * 1000;

  async getWarningsForZones(zoneNames: string[]): Promise<WeatherWarning[]> {
    const byZone = await this.getAllWarningsByZone();
    const result: WeatherWarning[] = [];
    for (const zone of zoneNames) {
      result.push(...(byZone.get(zone) ?? []));
    }
    return result;
  }

  private async getAllWarningsByZone(): Promise<Map<string, WeatherWarning[]>> {
    if (this.warningsCache && this.warningsCache.expiresAt > Date.now()) {
      return this.warningsCache.data;
    }

    const map = new Map<string, WeatherWarning[]>();

    try {
      const response = await fetch(this.WARNINGS_FEED_URL);
      if (!response.ok) {
        return map;
      }

      const xml = await response.text();
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const parsed = parser.parse(xml);

      const rawEntries = parsed?.feed?.entry;
      const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];
      const now = Date.now();

      for (const entry of entries) {
        const expires = new Date(entry['cap:expires']);
        if (Number.isNaN(expires.getTime()) || expires.getTime() < now) {
          continue; // avertizare deja expirata
        }

        const title: string = entry['title'] ?? '';
        const match = title.match(/^(Yellow|Orange|Red)\s+(.+?)\s+Warning issued for Romania/);
        if (!match) {
          continue;
        }

        const areaDesc: string = entry['cap:areaDesc'] ?? '';
        const zoneName = stripDiacritics(areaDesc);

        const warning: WeatherWarning = {
          zoneName,
          color: match[1] as 'Yellow' | 'Orange' | 'Red',
          event: match[2],
          severity: entry['cap:severity'] ?? 'Unknown',
          onset: new Date(entry['cap:onset']),
          expires,
        };

        const existing = map.get(zoneName) ?? [];
        existing.push(warning);
        map.set(zoneName, existing);
      }
    } catch {
      return map;
    }

    this.warningsCache = { data: map, expiresAt: Date.now() + this.WARNINGS_CACHE_TTL_MS };
    return map;
  }
}

export interface WeatherWarning {
  zoneName: string;
  color: 'Yellow' | 'Orange' | 'Red';
  event: string;
  severity: string;
  onset: Date;
  expires: Date;
}