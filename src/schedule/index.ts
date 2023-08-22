import { differenceInHours, parse } from "date-fns";
import { ChampionshipSchedule, Match } from "../types/ChampionshipMatches";
import { Schedule } from "./Schedule";

export async function findChampionshipScheduleNext24Hours(
  championshipId: number,
  rounds: ChampionshipSchedule[] | null,
) {
  const schedule = Schedule.getInstance();

  if (!rounds) {
    return;
  }

  for (const rodada of rounds) {
    if (rodada.rodadaAtual) {
      const scheduleNext24Hours = rodada.partidas.filter((match) => {
        const parsedTime1 = new Date(match.dataHora);
        const now = Date.now();

        const timeDifferenceInHours = differenceInHours(parsedTime1, now);

        // console.log(
        //   timeDifferenceInHours,
        //   match.mandante.nome,
        //   "x",
        //   match.visitante.nome,
        //   timeDifferenceInHours <= 24 && timeDifferenceInHours >= -3,
        // );

        return timeDifferenceInHours <= 24 && timeDifferenceInHours >= -3;
      });

      if (scheduleNext24Hours.length > 0) {
        schedule.setScheduleByChampionshipId(
          championshipId,
          scheduleNext24Hours,
        );

        schedule.setCurrentRound(championshipId, rodada.rodada);

        return scheduleNext24Hours;
      }
    }
  }
}
