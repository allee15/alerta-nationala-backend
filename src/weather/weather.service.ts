import { Injectable } from '@nestjs/common';
import { JUDETE } from '../common/data/judete';

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
}