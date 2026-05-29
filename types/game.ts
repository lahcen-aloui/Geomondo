export type GameMode = 'classico' | 'sprint' | 'paese' | 'italia';

export type GameStatus =
  | 'IDLE'
  | 'LOADING_PANORAMA'
  | 'PLAYING'
  | 'RESULT'
  | 'FINAL_SCORE'
  | 'LOCATION_ERROR';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CurrentLocation extends Coordinate {
  locationId: string;
}

export interface RoundResult {
  round_number: number;
  lat: number;
  lng: number;
  guess_lat: number;
  guess_lng: number;
  distance_km: number;
  score: number;
  time_used_seconds: number;
}

export interface LocationResponse {
  lat: number;
  lng: number;
  locationId: string;
}

export interface ScoreRound {
  round_number: number;
  lat: number;
  lng: number;
  guess_lat: number;
  guess_lng: number;
  time_used_seconds?: number;
}

export interface ScorePayload {
  mode: GameMode;
  rounds: ScoreRound[];
}

export interface ScoreResponseRound {
  round_number: number;
  distance_km: number;
  score: number;
}

export interface ScoreResponse {
  gameId: string;
  totalScore: number;
  rounds: ScoreResponseRound[];
}
