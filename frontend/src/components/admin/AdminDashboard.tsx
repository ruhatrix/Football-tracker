import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';
import MatchDetail from '../user/MatchDetail';

const AdminMatchDetail: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /*
   * Load Match Data
   */
  const loadMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      const matchData = await matchAPI.getMatchDetails(matchId);
      setMatch(matchData);
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  /*
   * Real-time updates (SSE)
   */
  useEffect(() => {
    if (!matchId) return;

    const eventSource = new EventSource(
      `http://localhost:3001/api/matches/${matchId}/stream`
    );

    let updateTimeout: NodeJS.Timeout;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (['INITIAL', 'GOAL', 'MATCH_STARTED', 'MATCH_ENDED', 'CARD', 'FOUL'].includes(data.type)) {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            setMatch(data.match);
          }, 50);
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      clearTimeout(updateTimeout);
      eventSource.close();
    };
  }, [matchId]);

  /*
   * Generic handler for admin actions
   */
  const handleAction = useCallback(
    async (action: () => Promise<void>, actionName: string) => {
      setActionLoading(actionName);
      try {
        await action();
      } catch (error) {
        alert(`Error performing ${actionName}`);
        console.error(error);
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  /*
   * Admin Action Handlers
   */
  const addGoal = useCallback(
    (team: 'A' | 'B') => {
      if (!matchId) return;
      const player = prompt(`Player name for Goal (Team ${team}):`) || `Player ${team}`;
      const description = prompt('Goal description (optional):');

      handleAction(
        () => matchAPI.addGoal(matchId, team, player, description),
        `goal-${team}`
      );
    },
    [matchId, handleAction]
  );

  const addCard = useCallback(
    (team: 'A' | 'B', cardType: 'yellow_card' | 'red_card') => {
      if (!matchId) return;
      const player = prompt(`Player name for card (Team ${team}):`) || `Player ${team}`;
      const description = prompt('Card description (optional):');

      handleAction(
        () => matchAPI.addCard(matchId, team, cardType, player, description),
        `card-${team}`
      );
    },
    [matchId, handleAction]
  );

  const addFoul = useCallback(
    (team: 'A' | 'B') => {
      if (!matchId) return;
      const player = prompt(`Player name for foul (Team ${team}):`) || `Player ${team}`;
      const description = prompt('Foul description (optional):');

      handleAction(
        () => matchAPI.addFoul(matchId, team, player, description),
        `foul-${team}`
      );
    },
    [matchId, handleAction]
  );

  const startMatch = useCallback(() => {
    if (!matchId) return;
    handleAction(() => matchAPI.startMatch(matchId), 'start-match');
  }, [matchId, handleAction]);

  const endMatch = useCallback(() => {
    if (!matchId) return;
    handleAction(() => matchAPI.endMatch(matchId), 'end-match');
  }, [matchId, handleAction]);

  /*
   * Render
   */
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Match Not Found</h3>
        <p>The match you're looking for doesn't exist.</p>
        <Link to="/admin" className="admin-btn primary">
          Back to Admin
        </Link>
      </div>
    );
  }

  const isActionLoading = (action: string) => actionLoading === action;

  return (
    <div className="admin-match-detail">
      <div className="admin-controls-panel">
        <div className="controls-header">
          <Link to="/admin" className="back-btn">
            ← Back to Admin
          </Link>
          <h2>Admin Controls</h2>
        </div>

        <div className="controls-grid">
          {match.status === 'pending' && (
            <button
              onClick={startMatch}
              disabled={isActionLoading('start-match')}
              className="admin-btn success"
            >
              {isActionLoading('start-match') ? '⏳' : '🚀'} Start Match
            </button>
          )}

          {match.status === 'ongoing' && (
            <button
              onClick={endMatch}
              disabled={isActionLoading('end-match')}
              className="admin-btn warning"
            >
              {isActionLoading('end-match') ? '⏳' : '✅'} End Match
            </button>
          )}

          <button
            onClick={() => addGoal('A')}
            disabled={isActionLoading('goal-A')}
            className="admin-btn danger"
          >
            {isActionLoading('goal-A') ? '⏳' : '⚽'} {match.teamA} Goal
          </button>

          <button
            onClick={() => addGoal('B')}
            disabled={isActionLoading('goal-B')}
            className="admin-btn danger"
          >
            {isActionLoading('goal-B') ? '⏳' : '⚽'} {match.teamB} Goal
          </button>

          <button
            onClick={() => addCard('A', 'yellow_card')}
            disabled={isActionLoading('card-A')}
            className="admin-btn warning"
          >
            {isActionLoading('card-A') ? '⏳' : '🟨'} {match.teamA} Card
          </button>

          <button
            onClick={() => addCard('B', 'yellow_card')}
            disabled={isActionLoading('card-B')}
            className="admin-btn warning"
          >
            {isActionLoading('card-B') ? '⏳' : '🟨'} {match.teamB} Card
          </button>

          <button
            onClick={() => addFoul('A')}
            disabled={isActionLoading('foul-A')}
            className="admin-btn secondary"
          >
            {isActionLoading('foul-A') ? '⏳' : '🤕'} {match.teamA} Foul
          </button>

          <button
            onClick={() => addFoul('B')}
            disabled={isActionLoading('foul-B')}
            className="admin-btn secondary"
          >
            {isActionLoading('foul-B') ? '⏳' : '🤕'} {match.teamB} Foul
          </button>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">{match.events.filter(e => e.type === 'goal').length}</div>
            <div className="stat-label">Goals</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{match.events.filter(e => e.type === 'yellow_card').length}</div>
            <div className="stat-label">Yellows</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{match.events.filter(e => e.type === 'red_card').length}</div>
            <div className="stat-label">Reds</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{match.events.filter(e => e.type === 'foul').length}</div>
            <div className="stat-label">Fouls</div>
          </div>
        </div>
      </div>

      {/* FIXED: Pass match as a prop */}
      <MatchDetail match={match} />
    </div>
  );
};

export default React.memo(AdminMatchDetail);
