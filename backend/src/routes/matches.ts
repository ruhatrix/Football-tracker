// backend/src/routes/matches.ts
import { Router } from 'express';
import {
  createMatch,
  startMatch,
  endMatch,
  addGoal,
  addCard,
  addFoul,
  getMatches,
  getMatchDetails,
  deleteMatch,
  streamMatchList,
  streamMatchDetails
} from '../controllers/matchController';

const router = Router();

// Admin endpoints
router.post('/admin/create', createMatch);
router.post('/admin/:matchId/start', startMatch);
router.post('/admin/:matchId/end', endMatch);
router.post('/admin/:matchId/goal', addGoal);
router.post('/admin/:matchId/card', addCard);
router.post('/admin/:matchId/foul', addFoul);
router.delete('/admin/:matchId', deleteMatch);

// User endpoints
router.get('/', getMatches);
router.get('/:matchId', getMatchDetails);

// Event streams
router.get('/stream/list', streamMatchList);
router.get('/:matchId/stream', streamMatchDetails);

export default router;