import { compareMatchesScores, updateChampionsipMatches } from "..";
import { Scores } from "../Scores";
import {
  finishMatchesMock,
  matchesMock,
  updatedMatchesMock,
} from "../__mocks__/match";

describe("Score", () => {
  let score: Scores;

  beforeEach(() => {
    score = new Scores();
  });

  it("should be defined", () => {
    expect(score).toBeDefined();
  });

  it("should be cache matches", () => {
    score.setCacheByChampionshipId(1, matchesMock);

    expect(score.getCacheByChampionshipId(1)).toEqual(matchesMock);
  });

  it("should be clear cache matches", () => {
    score.setCacheByChampionshipId(1, matchesMock);
    score.clearChampionshipCache(1);

    expect(score.getCacheByChampionshipId(1)).toBeUndefined();
  });

  it("should be add new match", async () => {
    score.setCacheByChampionshipId(1, matchesMock);
    const result = await updateChampionsipMatches(
      "Campeonato brasileiro",
      1,
      updatedMatchesMock,
    );

    expect(result).toHaveLength(2);
  });

  it("should be compare score and return if have team scored", async () => {
    score.setCacheByChampionshipId(1, matchesMock);
    const result = await updateChampionsipMatches(
      "Campeonato brasileiro",
      1,
      updatedMatchesMock,
    );

    expect(result).toBeDefined();

    await compareMatchesScores(
      1,
      "Campeonato brasileiro",
      result!,
      updatedMatchesMock,
    );
  });

  it("should sendm match fineshed alert", async () => {
    score.setCacheByChampionshipId(1, matchesMock);

    await updateChampionsipMatches(
      "Campeonato brasileiro",
      1,
      finishMatchesMock,
    );
  });
});
