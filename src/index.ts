import { CronJob } from "cron";
import { controlScores, findChampionshipById } from "./score";

import "dotenv/config";
import { Schedule } from "./schedule/Schedule";
import { watchedChampionships } from "./config/watched-championships";
import { findChampionshipScheduleNext24Hours } from "./schedule";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

async function loopScore() {
  controlScores();
}

async function findChampionship() {
  console.log("Buscando campeonatos...");
  const schedule = Schedule.getInstance();

  for (const [championshipName, championshipId] of Object.entries(
    watchedChampionships,
  )) {
    const championship = await findChampionshipById(championshipId);

    if (!championship) {
      continue;
    }

    const championshipSchedule = await findChampionshipScheduleNext24Hours(
      championshipId,
      championship.data.rodadas,
    );

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

const scheduleJob = new CronJob("0 */24 * * *", findChampionship);
const scoreJob = new CronJob("* * * * *", loopScore);

scheduleJob.start();
scoreJob.start();
