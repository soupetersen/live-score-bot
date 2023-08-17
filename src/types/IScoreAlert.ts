export interface IAlertScore {
  visitante: {
    id: number;
    gols: number;
    nome: string;
    urlLogo: string;
  };
  mandante: {
    id: number;
    gols: number;
    nome: string;
    urlLogo: string;
  };
  id: number;
}