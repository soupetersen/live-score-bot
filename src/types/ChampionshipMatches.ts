export type ChampionshipMatches = {
  data: ChampionshipDetails;
  pagination: number | null;
};

type ChampionshipDetails = {
  intervaloAtualizacaoRodadasEmMilis: number;
  intervaloAtualizacaoPartidaEmMilis: number;
  intervaloAtualizacaoScoutEmMilis: number;
  rodadas: ChampionshipSchedule[] | null;
};

export type CurrentRound = {
  round: number | undefined | null;
  stage: string | undefined | null;
};

export type ChampionshipSchedule = {
  fase: string | null | undefined;
  rodada: number | null | undefined;
  partidas: Match[] | undefined;
  rodadaAtual: boolean;
};

export type Match = {
  visitante: {
    id: number;
    gols: number;
    nome: string;
    sigla: string;
    urlLogo: string;
  };
  mandante: {
    id: number;
    gols: number;
    nome: string;
    sigla: string;
    urlLogo: string;
  };
  periodoJogo: string;
  idFase: number;
  temporeal: boolean;
  dataHora: string;
  scout: boolean;
  id: number;
};
