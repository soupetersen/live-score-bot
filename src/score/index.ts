import axios from "axios";
import { watchedChampionships } from "../config/watched-championships";
import {
  ChampionshipMatches,
  ChampionshipSchedule,
  Match,
} from "../types/ChampionshipMatches";
import { Scores } from "./Scores";

export async function controlScores() {
  for (const [championshipName, championshipId] of Object.entries(
    watchedChampionships,
  )) {
    const championship = await findChampionship(championshipId);
    const liveMatches = await findLiveMatches(
      championshipName,
      championshipId,
      championship?.data.rodadas,
    );

    const score = Scores.getInstance();

    if (!liveMatches) {
      console.log(`Não há jogos do ${championshipName} em tempo real`);
      score.clearChampionshipCache(championshipId);
      continue;
    }

    const updatedMatches = await score.updateChampionsipMatches(
      championshipName,
      championshipId,
      liveMatches,
    );

    if (!updatedMatches) {
      console.log(
        `Partidas do ${championshipName} atualizadas, nada para fazer aqui`,
      );
      continue;
    }

    await score.compareMatchesScores(
      championshipName,
      updatedMatches,
      liveMatches,
    );
  }
}

async function findChampionship(
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

async function findLiveMatches(
  championshipName: string,
  championshipId: number,
  championship: ChampionshipSchedule[] | null | undefined,
): Promise<Match[] | null> {
  if (!championship) {
    return null;
  }

  const currentSchedule =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    championship.find((schedule) => schedule.rodadaAtual === true)!.rodada - 1;

  if (!currentSchedule) {
    return null;
  }

  const scores = Scores.getInstance();
  const cachedMatches = scores.getCacheByChampionshipId(championshipId);

  const liveMatches = championship[currentSchedule].partidas.filter(
    (match) => match.temporeal === true,
  );

  if (liveMatches.length === 0) {
    return null;
  }

  const matchesFinished = cachedMatches?.filter((match) => {
    const matchFound = liveMatches.find((m) => m.id === match.id);

    if (matchFound) {
      return match.temporeal !== matchFound.temporeal;
    }

    return false;
  });

  if (matchesFinished && matchesFinished.length > 0) {
    console.log("Partidas finalizadas");
    scores.matchFinished(championshipName, matchesFinished);
    return null;
  }

  return liveMatches;
}
