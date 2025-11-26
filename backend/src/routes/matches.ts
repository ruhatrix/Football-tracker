// src/routes/matches.ts
import { Router } from 'express';
import {
  createMatch,
  startMatch,
  addGoal,
  getMatches,
  getMatchDetails,
  streamMatchList,
  streamMatchDetails
} from '../controllers/matchController';

const router = Router();

// Admin endpoints
router.post('/admin/create', createMatch);
router.post('/admin/:matchId/start', startMatch);
router.post('/admin/:matchId/goal', addGoal);

// User endpoints
router.get('/', getMatches);
router.get('/:matchId', getMatchDetails);

// Event streams
router.get('/stream/list', streamMatchList);
router.get('/:matchId/stream', streamMatchDetails);

export default router;