import { Match } from "../types/ChampionshipMatches";
import { sendScoreAlerts } from "./ScoreAlert";

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

  public clearChampionshipCache(championshipId: number): void {
    this.cache.delete(championshipId);
  }

  public updateChampionsipMatches(
    championshipId: number,
    matches: Match[],
  ): Match[] | undefined {
    const currentCache = this.getCacheByChampionshipId(championshipId);

    if (!currentCache) {
      this.setCacheByChampionshipId(championshipId, matches);
      return;
    }

    const currentCacheIds = currentCache.map((match) => match.id);
    const newMatches = matches.filter(
      (match) => !currentCacheIds.includes(match.id),
    );

    if (newMatches.length > 0) {
      const result = this.setCacheByChampionshipId(championshipId, [
        ...currentCache,
        ...newMatches,
      ]);

      return result;
    }

    return matches;
  }

  public compareMatchesScores(
    cachedMatches: Match[],
    matches: Match[],
  ): Promise<void> {
    return Promise.all(matches).then(() => {
      if (cachedMatches.length > 0) {
        cachedMatches.forEach(async (cache) => {
          const match = matches.find((m) => m.id === cache.id);

          if (!match) {
            return;
          }

          if (cache?.mandante.gols !== match.mandante.gols) {
            const message = `
            Gol do ${match.mandante.nome}
            Placar ${match.mandante.gols} x ${match.visitante.gols}
          `;
            await sendScoreAlerts(message);
          }

          if (cache?.visitante.gols !== match.visitante.gols) {
            const message = `
            Gol do ${match.visitante.nome}
            Placar ${match.visitante.gols} x ${match.mandante.gols}
          `;
            await sendScoreAlerts(message);
          }
        });
      }
    });
  }
}
