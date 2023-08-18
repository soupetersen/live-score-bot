import { Match } from "../types/ChampionshipMatches";
import { sendScoreAlerts } from "./ScoreAlert";
import { differenceInMinutes } from "date-fns";

const DIFFERENCE_IN_MINUTES = 2;

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

  public async updateChampionsipMatches(
    championshipName: string,
    championshipId: number,
    matches: Match[],
  ): Promise<Match[] | undefined> {
    const currentCache = this.getCacheByChampionshipId(championshipId);

    if (!currentCache) {
      this.matchStarted(championshipName, matches);
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
      this.matchStarted(championshipName, newMatches);
      return result;
    }

    return matches;
  }

  public async compareMatchesScores(
    championshipName: string,
    cachedMatches: Match[],
    matches: Match[],
  ) {
    if (cachedMatches.length > 0) {
      cachedMatches.forEach(async (cache) => {
        const match = matches.find((m) => m.id === cache.id);

        if (!match) {
          return;
        }

        console.log(`Comparando placares ${championshipName}`);
        console.log(
          `${match.mandante.sigla} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.sigla}`,
        );

        if (cache?.mandante.gols !== match.mandante.gols) {
          console.log("GOL DO MANDANTE");
          const message = `Gol do ${match.mandante.nome} \n\n ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome}`;
          await sendScoreAlerts(message);
        }

        if (cache?.visitante.gols !== match.visitante.gols) {
          console.log("GOL DO VISITANTE");
          const message = `Gol do ${match.visitante.nome} \n\n ${match.visitante.nome} ${match.visitante.gols} x ${match.mandante.gols} ${match.mandante.nome}`;
          await sendScoreAlerts(message);
        }
      });
    }
  }

  async matchStarted(championshipName: string, matches: Match[]) {
    matches.forEach(async (match) => {
      const timeDif = differenceInMinutes(new Date(), new Date(match.dataHora));
      if (timeDif > DIFFERENCE_IN_MINUTES) return;
      const message = `A partida entre ${match.mandante.nome} e ${match.visitante.nome} começou! \n\n 🏆 ${championshipName}`;
      await sendScoreAlerts(message);
    });
  }

  async matchFinished(championshipName: string, matches: Match[]) {
    matches.forEach(async (match) => {
      const message = `A partida entre ${match.mandante.nome} e ${match.visitante.nome} terminou! \n\n 🏆 ${championshipName}`;
      await sendScoreAlerts(message);
    });
  }
}
