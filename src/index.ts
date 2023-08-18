import { CronJob } from "cron";
import { controlScores } from "./score";

import "dotenv/config";

async function loop() {
  controlScores();
}

loop();

const job = new CronJob("* * * * *", loop);

job.start();
