// src/controllers/matchController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Match, MatchEvent, CreateMatchRequest } from '../types';

// In-memory storage (replace with database in production)
const matches: Map<string, Match> = new Map();
const clients: Map<string, Map<string, Response>> = new Map();

export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB }: CreateMatchRequest = req.body;

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
    events: []
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

  // Broadcast match start to all clients
  broadcastToMatchClients(matchId, {
    type: 'MATCH_STARTED',
    match
  });

  res.json(match);
};

export const addGoal = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const { team, player } = req.body;

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

  // Create goal event
  const event: MatchEvent = {
    id: uuidv4(),
    type: 'goal',
    team,
    player: player || `Player ${team === 'A' ? 'A' : 'B'}`,
    minute: Math.floor((new Date().getTime() - (match.startTime?.getTime() || new Date().getTime())) / 60000),
    timestamp: new Date()
  };

  match.events.push(event);

  // Broadcast update to all clients
  broadcastToMatchClients(matchId, {
    type: 'GOAL',
    match,
    event
  });

  res.json(match);
};

export const getMatches = (req: Request, res: Response) => {
  const ongoingMatches = Array.from(matches.values())
    .filter(match => match.status === 'ongoing');
  
  res.json(ongoingMatches);
};

export const getMatchDetails = (req: Request, res: Response) => {
  const { matchId } = req.params;
  const match = matches.get(matchId);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.json(match);
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
  const ongoingMatches = Array.from(matches.values())
    .filter(match => match.status === 'ongoing');
  
  res.write(`data: ${JSON.stringify({ type: 'INITIAL', matches: ongoingMatches })}\n\n`);

  // Add client to general match list stream
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

  // Send initial match data
  const match = matches.get(matchId)!;
  res.write(`data: ${JSON.stringify({ type: 'INITIAL', match })}\n\n`);

  // Add client to specific match stream
  if (!clients.has(matchId)) {
    clients.set(matchId, new Map());
  }
  clients.get(matchId)!.set(clientId, res);

  req.on('close', () => {
    clients.get(matchId)?.delete(clientId);
  });
};

// Helper function to broadcast to all clients of a match
function broadcastToMatchClients(matchId: string, data: any) {
  const matchClients = clients.get(matchId);
  if (matchClients) {
    matchClients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  // Also broadcast to match list clients for score updates
  const matchListClients = clients.get('match-list');
  if (matchListClients) {
    matchListClients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}