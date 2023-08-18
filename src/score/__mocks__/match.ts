import { Match } from "../../types/ChampionshipMatches";

export const matchesMock: Match[] = [
  {
    visitante: {
      id: 283,
      gols: 0,
      nome: "São Paulo",
      sigla: "SAO",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/sao_paulo_60x60.png",
    },
    mandante: {
      id: 284,
      gols: 0,
      nome: "Fluminense",
      sigla: "FLU",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/fluminense_60x60.png",
    },
    periodoJogo: "1T",
    idFase: 1,
    temporeal: true,
    dataHora: "2021-06-12T23:00:00",
    scout: true,
    id: 1,
  },
];

export const updatedMatchesMock: Match[] = [
  {
    visitante: {
      id: 283,
      gols: Math.round(Math.random() * 10),
      nome: "São Paulo",
      sigla: "SAO",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/sao_paulo_60x60.png",
    },
    mandante: {
      id: 284,
      gols: 0,
      nome: "Fluminense",
      sigla: "FLU",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/fluminense_60x60.png",
    },
    periodoJogo: "1T",
    idFase: 1,
    temporeal: true,
    dataHora: "2021-06-12T23:00:00",
    scout: true,
    id: 1,
  },
  {
    visitante: {
      id: 284,
      gols: 0,
      nome: "Bahia",
      sigla: "BAH",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/bahia_60x60.png",
    },
    mandante: {
      id: 285,
      gols: 0,
      nome: "Atlético-MG",
      sigla: "CAM",
      urlLogo:
        "https://s.glbimg.com/es/sde/f/equipes/2014/04/14/atletico_mg_60x60.png",
    },
    periodoJogo: "2T",
    idFase: 1,
    temporeal: true,
    dataHora: "2021-06-12T23:00:00",
    scout: true,
    id: 2,
  },
];
