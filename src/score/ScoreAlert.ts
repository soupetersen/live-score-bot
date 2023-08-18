import { TweetV2PostTweetResult } from "twitter-api-v2";

import { postTweet } from "../twitter";

export async function sendScoreAlerts(
  message: string,
): Promise<TweetV2PostTweetResult | Error> {
  return await postTweet(message);
}
