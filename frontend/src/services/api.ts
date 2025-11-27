// frontend/src/services/api.ts
import { Match } from '../types';

const API_BASE_URL = 'http://localhost:3001/api/matches';

export const matchAPI = {
  // Admin endpoints
  createMatch: async (teamA: string, teamB: string, venue?: string, competition?: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamA, teamB, venue, competition }),
    });
    return response.json();
  },

  startMatch: async (matchId: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/start`, {
      method: 'POST',
    });
    return response.json();
  },

  endMatch: async (matchId: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/end`, {
      method: 'POST',
    });
    return response.json();
  },

  addGoal: async (matchId: string, team: 'A' | 'B', player?: string, description?: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, player, description }),
    });
    return response.json();
  },

  addCard: async (matchId: string, team: 'A' | 'B', cardType: 'yellow_card' | 'red_card', player?: string, description?: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, cardType, player, description }),
    });
    return response.json();
  },

  addFoul: async (matchId: string, team: 'A' | 'B', player?: string, description?: string): Promise<Match> => {
    const response = await fetch(`${API_BASE_URL}/admin/${matchId}/foul`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, player, description }),
    });
    return response.json();
  },

  deleteMatch: async (matchId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/admin/${matchId}`, {
      method: 'DELETE',
    });
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