import { TweetV2PostTweetResult } from "twitter-api-v2";

import { postTweet } from "../twitter";

export async function sendScoreAlerts(
  message: string,
): Promise<TweetV2PostTweetResult | undefined> {
  return await postTweet(message);
}
