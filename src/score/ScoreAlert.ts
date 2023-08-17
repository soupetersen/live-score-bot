import { sendTelegram } from "../telegram";
import { postTweet } from "../twitter";
import { sendWhatsapp } from "../whatsapp";

export async function sendScoreAlerts(message: string) {
  Promise.all([
    await postTweet(message),
    await sendTelegram(message),
    await sendWhatsapp(message),
  ])
    .then(() => console.log("Mensagem enviada"))
    .catch((error) => console.log(error));
}
