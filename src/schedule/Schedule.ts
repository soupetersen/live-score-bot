import { CurrentRound, Match } from "../types/ChampionshipMatches";

export class Schedule {
  private static instance: Schedule;

  private schedule: Map<number, Match[]> = new Map();
  private currentRound: Map<number, CurrentRound> = new Map();

  private constructor() {
    if (Schedule.instance) {
      return Schedule.instance;
    }

    Schedule.instance = this;
  }

  public static getInstance(): Schedule {
    if (!Schedule.instance) {
      Schedule.instance = new Schedule();
    }

    return Schedule.instance;
  }

  public getSchedule(): Map<number, Match[]> {
    return this.schedule;
  }

  public getScheduleByChampionshipId(
    championshipId: number,
  ): Match[] | undefined {
    return this.schedule.get(championshipId);
  }

  public setScheduleByChampionshipId(
    championshipId: number,
    schedule: Match[],
  ): Match[] | undefined {
    this.schedule.set(championshipId, schedule);
    return schedule;
  }

  public setCurrentRound(championshipId: number, round: CurrentRound) {
    this.currentRound.set(championshipId, {
      round: round.round,
      stage: round.stage,
    });
  }

  public getCurrentRound(championshipId: number): CurrentRound {
    return this.currentRound.get(championshipId);
  }

  public removeMatchByChampionshipId(championshipId: number, matchId: number) {
    const schedule = this.getScheduleByChampionshipId(championshipId);

    if (!schedule) {
      return;
    }

    const newCache = schedule.filter((match) => match.id !== matchId);

    this.setScheduleByChampionshipId(championshipId, newCache);
  }

  public updateMatchByChampionshipId(
    championshipId: number,
    match: Match,
  ): Match[] | undefined {
    const schedule = this.getScheduleByChampionshipId(championshipId);

    if (schedule?.length === 0 || !schedule) {
      return;
    }

    const index = schedule.findIndex((m) => m.id === match.id);

    if (index === -1) {
      return;
    }

    schedule[index] = match;

    return schedule;
  }
}
