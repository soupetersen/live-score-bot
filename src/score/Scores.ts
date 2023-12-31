import { Match } from "../types/ChampionshipMatches";

export class Scores {
  private static instance: Scores;

  private cache: Map<number, Match[]> = new Map();

  constructor() {
    if (Scores.instance) {
      return Scores.instance;
    }

    Scores.instance = this;
  }

  public static getInstance(): Scores {
    if (!Scores.instance) {
      Scores.instance = new Scores();
    }

    return Scores.instance;
  }

  public getCache(): Map<number, Match[]> {
    return this.cache;
  }

  public getCacheByChampionshipId(championshipId: number): Match[] | undefined {
    return this.cache.get(championshipId);
  }

  public setCacheByChampionshipId(
    championshipId: number,
    match: Match[],
  ): Match[] | undefined {
    this.cache.set(championshipId, match);
    return match;
  }

  public removeMatchByChampionshipId(championshipId: number, matchId: number) {
    const cache = this.getCacheByChampionshipId(championshipId);

    if (!cache) {
      return;
    }

    const newCache = cache.filter((match) => match.id !== matchId);

    this.setCacheByChampionshipId(championshipId, newCache);
  }

  public clearChampionshipCache(championshipId: number): void {
    if (this.cache.size === 0) {
      return;
    }

    if (!this.cache.has(championshipId)) {
      return;
    }

    if (this.cache.has(championshipId)) {
      console.log(`Limpando cache do campeonato ${championshipId}`);
      this.cache.delete(championshipId);
    }
  }

  public getMatchByChampionshipId(championshipId: number, matchId: number) {
    const cache = this.getCacheByChampionshipId(championshipId);

    if (!cache) {
      return;
    }

    return cache.find((match) => match.id === matchId);
  }
}
