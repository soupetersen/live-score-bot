import axios from "axios";
import {
  championshipsWithStages,
  watchedChampionships,
} from "../config/watched-championships";
import {
  ChampionshipMatches,
  CurrentRound,
  Match,
} from "../types/ChampionshipMatches";
import { Scores } from "./Scores";
import { Schedule } from "../schedule/Schedule";
import { sendScoreAlerts } from "./ScoreAlert";
import { differenceInMinutes } from "date-fns";

const DIFFERENCE_IN_MINUTES = 2;
const MATCH_DURATION = 160;

export async function controlScores() {
  for (const [championshipName, championshipId] of Object.entries(
    watchedChampionships,
  )) {
    const score = Scores.getInstance();
    const schedule = Schedule.getInstance();

    let scheduleMatches = schedule.getScheduleByChampionshipId(championshipId);

    //CHECK IF SOME MATCH STARTED AND FINISHED TO REMOVE FROM CACHE
    const hasSomeMatchStarted = scheduleMatches?.some((match) => {
      const timeDiff = differenceInMinutes(
        new Date(),
        new Date(match.dataHora),
      );

      if (new Date() >= new Date(match.dataHora) && timeDiff < MATCH_DURATION) {
        return true;
      } else if (match.periodoJogo === "Final") {
        score.removeMatchByChampionshipId(championshipId, match.id);
        scheduleMatches = schedule.removeMatchByChampionshipId(
          championshipId,
          match.id,
        );
      }

      return false;
    });

    if (!hasSomeMatchStarted) {
      continue;
    }

    const liveMatches = await findLiveMatches(
      championshipId,
      schedule,
      scheduleMatches,
    );

    const cache = score.getCacheByChampionshipId(championshipId);

    if (cache) {
      cache.forEach((match) => {
        console.log(
          `\nCache do ${championshipName} encontrada: ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome}`,
        );
      });
    }

    if (liveMatches.length > 0) {
      liveMatches.forEach((match) => {
        console.log(
          `\nPartida do ${championshipName} encontrada: ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome}`,
        );
      });
    }

    await updateChampionsipMatches(
      championshipId,
      championshipName,
      liveMatches,
    );

    await compareMatchesScores(
      championshipId,
      championshipName,
      cache ?? [],
      liveMatches,
    );
  }
}

export async function findChampionshipById(
  championshipId: number,
): Promise<ChampionshipMatches | undefined> {
  try {
    return await axios
      .get(`${process.env.API_URL}/calendar/${championshipId}/current`)
      .then((response) => response.data);
  } catch (error) {
    console.log(error);
  }
}

export async function findLiveMatches(
  championshipId: number,
  schedule: Schedule,
  scheduleMatches: Match[] | null | undefined,
): Promise<Match[] | []> {
  if (!scheduleMatches || scheduleMatches.length === 0) {
    return [];
  }

  const liveMatches: Match[] = [];

  const championship = await findChampionshipById(championshipId);

  championship?.data.rodadas?.forEach((round) => {
    round.partidas.forEach((liveData) => {
      const match = scheduleMatches.find((ma) => ma.id === liveData.id);

      if (match && liveData.temporeal) {
        schedule.updateMatchByChampionshipId(championshipId, liveData);
        liveMatches.push(liveData);
      }
    });
  });

  return liveMatches;
}

export async function updateChampionsipMatches(
  championshipId: number,
  championshipName: string,
  liveMatches: Match[],
): Promise<Match[] | undefined> {
  const score = Scores.getInstance();
  const currentCache = score.getCacheByChampionshipId(championshipId);

  const schedule = Schedule.getInstance();
  const currentRound = schedule.getCurrentRound(championshipId);

  const stepMessage = buildChampionshipMessageByStage(
    championshipName,
    currentRound,
  );

  if (!currentCache) {
    if (liveMatches.length === 0) {
      score.clearChampionshipCache(championshipId);
      return;
    }

    liveMatches = await matchStarted(championshipId, liveMatches, stepMessage);
    score.setCacheByChampionshipId(championshipId, liveMatches);
    return;
  }

  const finished = await matchFinished(currentCache, liveMatches, stepMessage);

  if (finished && liveMatches.length === 0) {
    score.clearChampionshipCache(championshipId);
    return;
  }

  const currentCacheIds = currentCache.map((match) => match.id);
  const newMatches = liveMatches.filter(
    (match) => !currentCacheIds.includes(match.id),
  );

  if (newMatches.length > 0) {
    const updatedNewMatches = await matchStarted(
      championshipId,
      newMatches,
      stepMessage,
    );
    updatedNewMatches.forEach((match) => {
      const index = liveMatches.findIndex((m) => m.id === match.id);
      if (index === -1) {
        liveMatches[index] = match;
      }
    });
  }

  score.setCacheByChampionshipId(championshipId, liveMatches);
}

export async function compareMatchesScores(
  championshipId: number,
  championshipName: string,
  cachedMatches: Match[],
  matches: Match[],
) {
  if (cachedMatches && cachedMatches.length > 0) {
    const schedule = Schedule.getInstance();
    const currentRound = schedule.getCurrentRound(championshipId);

    for (const cache of cachedMatches) {
      const match = matches?.find((m) => m.id === cache.id);

      if (!match) {
        continue;
      }

      console.log(`\nComparando placares ${championshipName}\n`);
      console.log(
        `Antigo Placar: ${cache.mandante.sigla} ${cache.mandante.gols} x ${cache.visitante.gols} ${cache.visitante.sigla}`,
      );
      console.log(
        `\nNovo Placar: ${match.mandante.sigla} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.sigla}\n`,
      );

      const stageMessage = buildChampionshipMessageByStage(
        championshipName,
        currentRound,
      );

      if (
        cache?.mandante.gols !== match.mandante.gols ||
        cache?.visitante.gols !== match.visitante.gols
      ) {
        const invalidate = await invalidateScore(cache, match, stageMessage);

        if (invalidate) {
          continue;
        }

        const teamGolName =
          cache?.mandante.gols !== match.mandante.gols
            ? match.mandante.nome
            : match.visitante.nome;

        const message = `⚽ GOOL DO ${teamGolName} \n\n ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome} \n\n ${stageMessage}`;
        await sendScoreAlerts(message);
      }
    }
  }
}

export async function matchStarted(
  championshipId: number,
  matches: Match[],
  stageMessage: string,
): Promise<Match[]> {
  const score = Scores.getInstance();

  matches.forEach(async (match) => {
    if (new Date(match.dataHora) > new Date()) return;

    const cacheMatch = score.getMatchByChampionshipId(championshipId, match.id);

    if (cacheMatch) {
      return;
    }

    if (match.mandante.gols > 0 || match.visitante.gols > 0) {
      match.mandante.gols = 0;
      match.visitante.gols = 0;
    }

    const message = `A partida entre ${match.mandante.nome} x ${match.visitante.nome} começou! \n\n ${stageMessage}`;
    await sendScoreAlerts(message);
  });

  return matches;
}

export async function matchFinished(
  cachedMatches: Match[],
  liveMatches: Match[],
  stageMessage: string,
): Promise<boolean> {
  const matchesFinished = cachedMatches?.filter((match) => {
    const matchFound = liveMatches?.find((m) => m.id === match.id);

    if (!matchFound) {
      return match;
    }
  });

  if (matchesFinished.length === 0) {
    return false;
  }

  matchesFinished.forEach(async (match) => {
    const message = `Partida finalizada ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome} \n\n ${stageMessage}`;
    await sendScoreAlerts(message);
  });

  return true;
}

export async function invalidateScore(
  cache: Match,
  match: Match,
  stepMessage: string,
): Promise<boolean> {
  if (
    cache.mandante.gols > match?.mandante.gols ||
    cache.visitante.gols > match.visitante.gols
  ) {
    console.log("GOL ANULADO");

    const teamInvalidationName =
      cache.mandante.gols > match?.mandante.gols
        ? match.mandante.nome
        : match.visitante.nome;

    const message = `❌ Gol anulado do ${teamInvalidationName} \n\n ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome} \n\n ${stepMessage}`;
    await sendScoreAlerts(message);
    return true;
  }

  return false;
}

function buildChampionshipMessageByStage(
  championshipName: string,
  currentRound?: CurrentRound,
): string {
  if (championshipsWithStages.includes(championshipName)) {
    return `🏆 ${championshipName} | ${currentRound?.stage}`;
  }

  return `🏆 ${championshipName} ${
    currentRound?.round ? `| Rodada ${currentRound?.round}` : ""
  }`;
}
