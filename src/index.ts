import { CronJob } from "cron";
import { watchedChampionships } from "./config/watched-championships";

import "dotenv/config";

import { controlScores } from "./score";

async function loop() {
  controlScores();
}

loop();

// var job = new CronJob(
//   '* * * * *',
//   findMatches
// );

// job.start();
