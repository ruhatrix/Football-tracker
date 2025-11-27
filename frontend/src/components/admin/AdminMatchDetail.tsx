import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';

const AdminMatchDetail: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleAction = useCallback(async (action: () => Promise<void>, actionName: string) => {
    setActionLoading(actionName);
    try {
      await action();
      await loadMatch(); // Reload match data after action
    } catch (error) {
      alert(`Error performing ${actionName}`);
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  }, [loadMatch]);

  const addGoal = useCallback((team: 'A' | 'B') => {
    if (!matchId) return;
    const player = prompt(`Enter player name for goal (Team ${team}):`) || `Player ${team}`;
    handleAction(
      () => matchAPI.addGoal(matchId, team, player),
      `goal-${team}`
    );
  }, [matchId, handleAction]);

  const startMatch = useCallback(() => {
    if (!matchId) return;
    handleAction(() => matchAPI.startMatch(matchId), 'start-match');
  }, [matchId, handleAction]);

  const endMatch = useCallback(() => {
    if (!matchId) return;
    handleAction(() => matchAPI.endMatch(matchId), 'end-match');
  }, [matchId, handleAction]);

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
      {/* Admin Controls */}
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
        </div>

        {/* Match Info */}
        <div className="match-info-preview">
          <div className="teams-preview">
            <div className="team-preview">
              <div className="team-name">{match.teamA}</div>
              <div className="team-score">{match.scoreA}</div>
            </div>
            <div className="vs-preview">VS</div>
            <div className="team-preview">
              <div className="team-score">{match.scoreB}</div>
              <div className="team-name">{match.teamB}</div>
            </div>
          </div>
          <div className="match-meta">
            <span>{match.venue}</span>
            <span>•</span>
            <span>{match.competition}</span>
            <span>•</span>
            <span className={`status-${match.status}`}>{match.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Simple Match View */}
      <div className="simple-match-view">
        <h3>Match Events</h3>
        {match.events.length === 0 ? (
          <div className="empty-events">
            <p>No events yet. Add goals to see them here.</p>
          </div>
        ) : (
          <div className="events-list">
            {match.events.map(event => (
              <div key={event.id} className="event-item">
                <span className="event-minute">{event.minute}'</span>
                <span className="event-type">
                  {event.type === 'goal' && '⚽ Goal'}
                  {event.type === 'yellow_card' && '🟨 Yellow Card'}
                  {event.type === 'red_card' && '🟥 Red Card'}
                </span>
                <span className="event-player">{event.player}</span>
                <span className="event-team">
                  ({event.team === 'A' ? match.teamA : match.teamB})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatchDetail;