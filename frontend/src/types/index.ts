// frontend/src/types/index.ts
export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'pending' | 'ongoing' | 'completed';
  events: MatchEvent[];
  startTime?: string;
  endTime?: string;
  venue?: string;
  competition?: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'foul' | 'substitution' | 'penalty';
  team: 'A' | 'B';
  player: string;
  minute: number;
  timestamp: string;
  description?: string;
}