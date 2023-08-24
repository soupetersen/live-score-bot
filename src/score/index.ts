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

export async function controlScores() {
  for (const [championshipName, championshipId] of Object.entries(
    watchedChampionships,
  )) {
    const score = Scores.getInstance();
    const schedule = Schedule.getInstance();

    const scheduleMatches =
      schedule.getScheduleByChampionshipId(championshipId);

    const hasSomeMatchStarted = scheduleMatches?.some((match) => {
      const timeDiff = differenceInMinutes(
        new Date(),
        new Date(match.dataHora),
      );
      if (timeDiff >= DIFFERENCE_IN_MINUTES) return true;

      return false;
    });

    if (
      score.getCacheByChampionshipId(championshipId)?.length === 0 ||
      !hasSomeMatchStarted
    ) {
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
  matches: Match[] | null | undefined,
): Promise<Match[] | []> {
  if (!matches || matches.length === 0) {
    return [];
  }

  const liveMatches: Match[] = [];

  const championship = await findChampionshipById(championshipId);

  championship?.data.rodadas?.forEach((round) => {
    round.partidas.forEach((liveData) => {
      const match = matches.find((ma) => ma.id === liveData.id);

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
      score.setCacheByChampionshipId(championshipId, liveMatches);
      return;
    }

    matchStarted(championshipName, liveMatches, stepMessage);
    score.setCacheByChampionshipId(championshipId, liveMatches);
    return;
  }

  const finished = await matchFinished(
    championshipName,
    currentCache,
    liveMatches,
    stepMessage,
  );

  if (finished && liveMatches.length === 0) {
    score.clearChampionshipCache(championshipId);
  }

  const currentCacheIds = currentCache.map((match) => match.id);
  const newMatches = liveMatches.filter(
    (match) => !currentCacheIds.includes(match.id),
  );

  score.setCacheByChampionshipId(championshipId, liveMatches);

  if (newMatches.length > 0) {
    matchStarted(championshipName, newMatches, stepMessage);
  }

  return liveMatches;
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

      if (cache?.mandante.gols !== match.mandante.gols) {
        const invalidate = await invalidateScore(
          cache,
          match,
          championshipName,
          stageMessage,
        );

        if (invalidate) {
          continue;
        }

        const message = `⚽ GOOL DO ${match.mandante.nome} \n\n ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome} \n\n ${stageMessage}`;
        await sendScoreAlerts(message);
      }

      if (cache?.visitante.gols !== match.visitante.gols) {
        const invalidate = await invalidateScore(
          cache,
          match,
          championshipName,
          stageMessage,
        );

        if (invalidate) {
          continue;
        }

        const message = `⚽ GOOL DO ${match.visitante.nome} \n\n ${match.visitante.nome} ${match.visitante.gols} x ${match.mandante.gols} ${match.mandante.nome} \n\n ${stageMessage}`;
        await sendScoreAlerts(message);
      }
    }
  }
}

export async function matchStarted(
  championshipName: string,
  matches: Match[],
  stageMessage: string,
) {
  for (const match of matches) {
    const timeDif = differenceInMinutes(new Date(), new Date(match.dataHora));
    if (timeDif > DIFFERENCE_IN_MINUTES) continue;

    const message = `A partida entre ${match.mandante.nome} x ${match.visitante.nome} começou! \n\n ${stageMessage}`;
    await sendScoreAlerts(message);
  }
}

export async function matchFinished(
  championshipName: string,
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
  championshipName: string,
  stepMessage: string,
): Promise<boolean> {
  if (cache.mandante.gols > match?.mandante.gols) {
    console.log("GOL ANULADO");
    const message = `❌ Gol anulado do ${match.mandante.nome} \n\n ${match.mandante.nome} ${match.mandante.gols} x ${match.visitante.gols} ${match.visitante.nome} \n\n ${stepMessage}`;
    await sendScoreAlerts(message);
    return true;
  }

  if (cache.visitante.gols > match.visitante.gols) {
    console.log("GOL ANULADO");
    const message = `❌ Gol anulado do ${match.visitante.nome} \n\n ${match.visitante.nome} ${match.visitante.gols} x ${match.mandante.gols} ${match.mandante.nome} \n\n ${stepMessage}`;
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
