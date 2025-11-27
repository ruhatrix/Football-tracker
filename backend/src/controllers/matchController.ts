// backend/src/controllers/matchController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Match, MatchEvent, CreateMatchRequest } from '../types';

// In-memory storage
const matches: Map<string, Match> = new Map();
const clients: Map<string, Map<string, Response>> = new Map();

export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB, venue, competition }: CreateMatchRequest = req.body;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: 'Both teams are required' });
  }

  const match: Match = {
    id: uuidv4(),
    teamA,
    teamB,
    scoreA: 0,
    scoreB: 0,
    status: 'pending',
    events: [],
    venue: venue || 'Stadium',
    competition: competition || 'Friendly Match'
  };

  matches.set(match.id, match);
  clients.set(match.id, new Map());

  res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
  const { matchId } = req.params;

  const match = matches.get(matchId);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  if (match.status !== 'pending') {
    return res.status(400).json({ error: 'Match already started or completed' });
  }

  match.status = 'ongoing';
  match.startTime = new Date();

  broadcastToMatchClients(matchId, {
    type: 'MATCH_STARTED',
    match
  });

  res.json(match);
};

export const endMatch = (req: Request, res: Response) => {
  const { matchId } = req.params;

  const match = matches.get(matchId);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  if (match.status !== 'ongoing') {
    return res.status(400).json({ error: 'Match is not ongoing' });
  }

  match.status = 'completed';
  match.endTime = new Date();

  broadcastToMatchClients(matchId, {
    type: 'MATCH_ENDED',
    match
  });

  res.json(match);
};

export const addGoal = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { team, player, description } = req.body;

  const match = matches.get(matchId);
  if (!match || match.status !== 'ongoing') {
    return res.status(404).json({ error: 'Match not found or not ongoing' });
  }

  // Update score
  if (team === 'A') {
    match.scoreA++;
  } else {
    match.scoreB++;
  }

  const event: MatchEvent = {
    id: uuidv4(),
    type: 'goal',
    team,
    player: player || `Player ${team === 'A' ? 'A' : 'B'}`,
    minute: calculateMatchMinute(match),
    timestamp: new Date(),
    description
  };

  match.events.push(event);

  broadcastToMatchClients(matchId, {
    type: 'GOAL',
    match,
    event
  });

  res.json(match);
};

export const addCard = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { team, player, cardType, description } = req.body;

  const match = matches.get(matchId);
  if (!match || match.status !== 'ongoing') {
    return res.status(404).json({ error: 'Match not found or not ongoing' });
  }

  const event: MatchEvent = {
    id: uuidv4(),
    type: cardType,
    team,
    player: player || `Player ${team === 'A' ? 'A' : 'B'}`,
    minute: calculateMatchMinute(match),
    timestamp: new Date(),
    description
  };

  match.events.push(event);

  broadcastToMatchClients(matchId, {
    type: 'CARD',
    match,
    event
  });

  res.json(match);
};

export const addFoul = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { team, player, description } = req.body;

  const match = matches.get(matchId);
  if (!match || match.status !== 'ongoing') {
    return res.status(404).json({ error: 'Match not found or not ongoing' });
  }

  const event: MatchEvent = {
    id: uuidv4(),
    type: 'foul',
    team,
    player: player || `Player ${team === 'A' ? 'A' : 'B'}`,
    minute: calculateMatchMinute(match),
    timestamp: new Date(),
    description
  };

  match.events.push(event);

  broadcastToMatchClients(matchId, {
    type: 'FOUL',
    match,
    event
  });

  res.json(match);
};

export const getMatches = (req: Request, res: Response) => {
  const allMatches = Array.from(matches.values());
  res.json(allMatches);
};

export const getMatchDetails = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const match = matches.get(matchId);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.json(match);
};

export const deleteMatch = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const match = matches.get(matchId);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  matches.delete(matchId);
  clients.delete(matchId);

  res.json({ message: 'Match deleted successfully' });
};

// Event Stream endpoints
export const streamMatchList = (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const clientId = uuidv4();

  // Send initial data
  const allMatches = Array.from(matches.values());
  
  res.write(`data: ${JSON.stringify({ type: 'INITIAL', matches: allMatches })}\n\n`);

  if (!clients.has('match-list')) {
    clients.set('match-list', new Map());
  }
  clients.get('match-list')!.set(clientId, res);

  req.on('close', () => {
    clients.get('match-list')?.delete(clientId);
  });
};

export const streamMatchDetails = (req: Request, res: Response) => {
  const { matchId } = req.params;

  if (!matches.has(matchId)) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const clientId = uuidv4();

  const match = matches.get(matchId)!;
  res.write(`data: ${JSON.stringify({ type: 'INITIAL', match })}\n\n`);

  if (!clients.has(matchId)) {
    clients.set(matchId, new Map());
  }
  clients.get(matchId)!.set(clientId, res);

  req.on('close', () => {
    clients.get(matchId)?.delete(clientId);
  });
};

// Helper functions
function calculateMatchMinute(match: Match): number {
  if (!match.startTime) return 0;
  const now = new Date();
  const diffMs = now.getTime() - match.startTime.getTime();
  return Math.floor(diffMs / 60000); // Convert to minutes
}

function broadcastToMatchClients(matchId: string, data: any) {
  const matchClients = clients.get(matchId);
  if (matchClients) {
    matchClients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  const matchListClients = clients.get('match-list');
  if (matchListClients) {
    matchListClients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}