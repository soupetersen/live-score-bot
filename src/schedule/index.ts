import { differenceInHours, parse } from "date-fns";
import { ChampionshipSchedule, Match } from "../types/ChampionshipMatches";
import { Schedule } from "./Schedule";
import { brazilianTeams } from "../config/watched-championships";

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

        const inTime =
          timeDifferenceInHours <= 24 && timeDifferenceInHours >= -3;

        // check if championship is Libertadores or Sul Americana for return only brazilian teams
        if (championshipId === 839 || championshipId === 853) {
          const isBrazilianTeam =
            brazilianTeams.includes(match.mandante.nome) ||
            brazilianTeams.includes(match.visitante.nome);

          if (isBrazilianTeam) return inTime;

          return false;
        }

        return inTime;
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
