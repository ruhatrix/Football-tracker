// src/types/index.ts
export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'pending' | 'ongoing' | 'completed';
  events: MatchEvent[];
  startTime?: Date;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'foul';
  team: 'A' | 'B';
  player: string;
  minute: number;
  timestamp: Date;
}

export interface CreateMatchRequest {
  teamA: string;
  teamB: string;
}