// backend/src/types/index.ts
export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'pending' | 'ongoing' | 'completed';
  events: MatchEvent[];
  startTime?: Date;
  endTime?: Date;
  venue?: string;
  competition?: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'foul' | 'substitution' | 'penalty';
  team: 'A' | 'B';
  player: string;
  minute: number;
  timestamp: Date;
  description?: string;
}

export interface CreateMatchRequest {
  teamA: string;
  teamB: string;
  venue?: string;
  competition?: string;
}