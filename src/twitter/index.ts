import { TweetV2PostTweetResult, TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY ?? "",
  appSecret: process.env.TWITTER_API_SECRET ?? "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
});

export async function postTweet(
  tweet: string,
): Promise<TweetV2PostTweetResult | Error> {
  try {
    return await client.v2.tweet(tweet);
  } catch (error) {
    return Promise.reject(error);
  }
}
