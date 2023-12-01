import { controlScores, findChampionshipById } from "./score";

import "dotenv/config";
import { Schedule } from "./schedule/Schedule";
import { watchedChampionships } from "./config/watched-championships";
import { findChampionshipScheduleNext24Hours } from "./schedule";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const INTERVAL_30_SECONDS = 30 * 1000;
const INTERVAL_24_HOURS = 24 * 60 * 60 * 1000;

async function loopScore() {
  controlScores();
}

async function findChampionship() {
  const schedule = Schedule.getInstance();

  for (const [championshipName, championshipId] of Object.entries(
    watchedChampionships,
  )) {
    const championship = await findChampionshipById(championshipId);

    if (!championship) {
      continue;
    }

    await findChampionshipScheduleNext24Hours(
      championshipId,
      championship.data.rodadas,
    );

    const championshipSchedule =
      schedule.getScheduleByChampionshipId(championshipId);

    championshipSchedule?.map((match) => {
      console.log(
        `\nPartida do ${championshipName} encontrada: ${
          match.mandante.nome
        } x ${match.visitante.nome} \n horário: ${format(
          new Date(match.dataHora),
          "dd MMM - HH:mm",
          {
            locale: ptBR,
          },
        )} \n`,
      );
    });

    if (championshipSchedule) {
      schedule.setScheduleByChampionshipId(
        championshipId,
        championshipSchedule,
      );
    }
  }
}

findChampionship();

setInterval(findChampionship, INTERVAL_24_HOURS);
setInterval(loopScore, INTERVAL_30_SECONDS);
