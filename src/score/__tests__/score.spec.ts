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
    score.setCacheByChampionshipId(850, matchesMock);

    expect(score.getCacheByChampionshipId(850)).toEqual(matchesMock);
  });

  it("should be clear cache matches", () => {
    score.setCacheByChampionshipId(850, matchesMock);
    score.clearChampionshipCache(850);

    expect(score.getCacheByChampionshipId(850)).toBeUndefined();
  });

  it("should be add new match", async () => {
    score.setCacheByChampionshipId(850, matchesMock);
    await updateChampionsipMatches(
      850,
      "Brasileirão Série A 2023",
      updatedMatchesMock,
    );

    const result = score.getCacheByChampionshipId(850);

    expect(result).toHaveLength(updatedMatchesMock.length);
  });

  it("should sendm match fineshed alert", async () => {
    score.setCacheByChampionshipId(850, matchesMock);

    await updateChampionsipMatches(
      850,
      "Brasileirão Série A 2023",
      finishMatchesMock,
    );
  });

  it("should alert when a match have a goal", async () => {
    score.setCacheByChampionshipId(850, matchesMock);

    await compareMatchesScores(
      850,
      "Brasileirão Série A 2023",
      matchesMock,
      updatedMatchesMock,
    );
  });
});
