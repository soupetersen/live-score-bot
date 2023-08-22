import { ChampionshipSchedule, Match } from "../types/ChampionshipMatches";

export class Schedule {
  private static instance: Schedule;

  private schedule: Map<number, Match[]> = new Map();
  private currentRound: Map<number, number | undefined | null> = new Map();

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

  public setCurrentRound(championshipId: number, round: number) {
    this.currentRound.set(championshipId, round);
  }

  public getCurrentRound(championshipId: number): number | undefined | null {
    return this.currentRound.get(championshipId);
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
