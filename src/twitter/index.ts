import { ApiRequestError, TwitterApi } from "twitter-api-v2";

import "dotenv/config";

export async function postTweet(tweet: string) {
  console.log("POST TWEET", tweet);

  const client = await twitterCLient();
  try {
    return await client.v2.tweet(tweet);
  } catch (error) {
    console.log("error", error);
    throw new Error(`Error posting tweet: ${error}`);
  }
}

export async function twitterCLient(): Promise<TwitterApi> {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY ?? "",
    appSecret: process.env.TWITTER_API_SECRET ?? "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
    accessSecret: process.env.TWITTER_ACCESS_SECRET ?? "",
  });
}
