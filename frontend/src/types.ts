export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export type ContentType = 'text' | 'bild';

export interface GameItem {
  id: string;
  typ: ContentType;
  inhalt: string;
}

export interface Round {
  roundId: string;
  kategorie: 'gedicht' | 'prosa' | 'gemaelde' | string;
  kuenstler?: string;
  thema?: string;
  items: GameItem[]; // Exactly 2 items
}

export interface DailyChallenge {
  date: string;
  difficulty: Difficulty;
  rounds: Round[];
}

export interface RevealInfo {
  roundId: string;
  fakeId: string;
  model: string;
  kuenstler?: string;
  thema?: string;
  quelle?: string;
}

export interface SubmissionResult {
  score: number;
  correct: number;
  total: number;
  countsForGlobal: boolean;
  reveal: RevealInfo[];
  durationMs?: number;
  guesses?: Record<string, string>;
}

export interface ScoreEntry {
  displayName: string;
  score?: number; // For daily
  correct?: number; // For daily
  total?: number; // For daily
  durationMs?: number; // For daily
  totalScore?: number; // For global
  totalCorrect?: number; // For global
  totalDurationMs?: number; // For global
  challengesPlayed?: number; // For global
}

export interface ModelInfo {
  id: string;
  label: string;
  provider: string;
  info: string;
}

export interface TierInfo {
  difficulty: Difficulty;
  beschreibung: string;
  textModelle: ModelInfo[];
  bildModelle: ModelInfo[];
}

export interface DailyStatusResult {
  completed: boolean;
  score?: number;
  correct?: number;
  total?: number;
  durationMs?: number;
  abandoned?: boolean;
}

export interface DailyStatus {
  date: string;
  results: {
    leicht: DailyStatusResult | null;
    mittel: DailyStatusResult | null;
    schwer: DailyStatusResult | null;
  };
}

export interface GetTiersResponse {
  tiers: TierInfo[];
}
