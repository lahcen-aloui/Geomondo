import { create } from 'zustand';
import type {
  GameMode,
  GameStatus,
  Coordinate,
  CurrentLocation,
  RoundResult,
} from '@/types/game';
import { haversineKm } from '@/lib/haversine';
import { calculateScore } from '@/lib/scoring';

const TOTAL_ROUNDS = 5;
const MAX_PANORAMA_RETRIES = 6;

interface GameStore {
  mode: GameMode | null;
  status: GameStatus;
  currentRound: number;
  currentLocation: CurrentLocation | null;
  pendingGuess: Coordinate | null;
  rounds: RoundResult[];
  totalScore: number;
  secondsRemaining: number;
  roundStartedAt: number | null;
  usedLocationIds: string[];
  panoramaRetryCount: number;

  startGame: (mode: GameMode) => void;
  locationLoaded: (coord: CurrentLocation) => void;
  reloadLocation: () => void;
  setPendingGuess: (guess: Coordinate | null) => void;
  submitGuess: (guess: Coordinate) => void;
  nextRound: () => void;
  resetGame: () => void;
  decrementTimer: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  mode: null,
  status: 'IDLE',
  currentRound: 1,
  currentLocation: null,
  pendingGuess: null,
  rounds: [],
  totalScore: 0,
  secondsRemaining: 60,
  roundStartedAt: null,
  usedLocationIds: [],
  panoramaRetryCount: 0,

  startGame(mode) {
    set({
      mode,
      status: 'LOADING_PANORAMA',
      currentRound: 1,
      currentLocation: null,
      pendingGuess: null,
      rounds: [],
      totalScore: 0,
      secondsRemaining: 60,
      roundStartedAt: null,
      usedLocationIds: [],
      panoramaRetryCount: 0,
    });
  },

  locationLoaded(coord) {
    set(state => ({
      currentLocation: coord,
      status: 'PLAYING',
      secondsRemaining: 60,
      roundStartedAt: Date.now(),
      usedLocationIds: [...state.usedLocationIds, coord.locationId],
    }));
  },

  reloadLocation() {
    set(state => {
      const panoramaRetryCount = state.panoramaRetryCount + 1;

      if (panoramaRetryCount >= MAX_PANORAMA_RETRIES) {
        return {
          status: 'LOCATION_ERROR',
          currentLocation: null,
          panoramaRetryCount,
        };
      }

      return {
        status: 'LOADING_PANORAMA',
        currentLocation: null,
        panoramaRetryCount,
      };
    });
  },

  setPendingGuess(guess) {
    set({ pendingGuess: guess });
  },

  submitGuess(guess) {
    const { currentLocation, currentRound, roundStartedAt } = get();
    if (!currentLocation) return;

    const distanceKm = haversineKm(
      currentLocation.lat,
      currentLocation.lng,
      guess.lat,
      guess.lng,
    );
    const score = calculateScore(distanceKm);
    const timeUsed = roundStartedAt
      ? Math.round((Date.now() - roundStartedAt) / 1000)
      : 0;

    const roundResult: RoundResult = {
      round_number: currentRound,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      guess_lat: guess.lat,
      guess_lng: guess.lng,
      distance_km: distanceKm,
      score,
      time_used_seconds: timeUsed,
    };

    set(state => ({
      rounds: [...state.rounds, roundResult],
      totalScore: state.totalScore + score,
      status: 'RESULT',
      pendingGuess: null,
    }));
  },

  nextRound() {
    const { currentRound } = get();
    const next = currentRound + 1;
    if (next > TOTAL_ROUNDS) {
      set({ status: 'FINAL_SCORE' });
    } else {
      set({
        currentRound: next,
        currentLocation: null,
        pendingGuess: null,
        status: 'LOADING_PANORAMA',
        panoramaRetryCount: 0,
      });
    }
  },

  resetGame() {
    set({
      mode: null,
      status: 'IDLE',
      currentRound: 1,
      currentLocation: null,
      pendingGuess: null,
      rounds: [],
      totalScore: 0,
      secondsRemaining: 60,
      roundStartedAt: null,
      usedLocationIds: [],
      panoramaRetryCount: 0,
    });
  },

  decrementTimer() {
    set(state => ({ secondsRemaining: Math.max(0, state.secondsRemaining - 1) }));
  },
}));
