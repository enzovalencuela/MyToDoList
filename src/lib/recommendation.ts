export interface RecommendationItem {
  titulo: string;
  motivo: string;
  tempoEstimado: string;
}

export interface RecommendationResponse {
  saudacao: string;
  recomendacoes: RecommendationItem[];
}

export const EMPTY_RECOMMENDATION: RecommendationResponse = {
  saudacao: "Vamos escolher um proximo passo simples para hoje.",
  recomendacoes: [],
};
