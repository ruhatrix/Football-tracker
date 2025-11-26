import { Match } from '../types';

const API_BASE_URL = 'http://localhost:3001/api/matches';

export const matchAPI = {
  // Admin endpoints (for testing)
  createMatch: async (teamA: string, teamB: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamA, teamB }),
    });
    return response.json();
  },

  startMatch: async (matchId: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/start`, {
      method: 'POST',
    });
    return response.json();
  },

  addGoal: async (matchId: string, team: 'A' | 'B', player?: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, player }),
    });
    return response.json();
  },

  // User endpoints
  getMatches: async (): Promise<Match[]> => {
    const response = await fetch(`${API_BASE_URL}`);
    return response.json();
  },

  getMatchDetails: async (matchId: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/${matchId}`);
    return response.json();
  },
};