import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';

const AdminMatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      const allMatches = await matchAPI.getMatches();
      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const startMatch = async (matchId: string) => {
    setActionLoading(`start-${matchId}`);
    try {
      await matchAPI.startMatch(matchId);
      await loadMatches();
    } catch (error) {
      alert('Error starting match');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const endMatch = async (matchId: string) => {
    setActionLoading(`end-${matchId}`);
    try {
      await matchAPI.endMatch(matchId);
      await loadMatches();
    } catch (error) {
      alert('Error ending match');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (confirm('Are you sure you want to delete this match?')) {
      setActionLoading(`delete-${matchId}`);
      try {
        await matchAPI.deleteMatch(matchId);
        await loadMatches();
      } catch (error) {
        alert('Error deleting match');
        console.error(error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const addGoal = async (matchId: string, team: 'A' | 'B') => {
    setActionLoading(`goal-${matchId}-${team}`);
    const player = prompt(`Enter player name for goal (Team ${team}):`) || `Player ${team}`;
    try {
      await matchAPI.addGoal(matchId, team, player);
      await loadMatches();
    } catch (error) {
      alert('Error adding goal');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading matches...</p>
      </div>
    );
  }

  const ongoingMatches = matches.filter(m => m.status === 'ongoing');
  const pendingMatches = matches.filter(m => m.status === 'pending');
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <div className="admin-match-list">
      {/* Header */}
      <div className="admin-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="admin-subtitle">Manage all football matches</p>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions">
        <Link to="/admin/create" className="admin-btn primary">
          ➕ Create New Match
        </Link>
        <button 
          onClick={async () => {
            const teams = [
              ['Arsenal', 'Chelsea'],
              ['Manchester United', 'Liverpool'],
              ['Barcelona', 'Real Madrid'],
              ['Bayern Munich', 'Borussia Dortmund']
            ];
            const randomTeams = teams[Math.floor(Math.random() * teams.length)];
            try {
              await matchAPI.createMatch(randomTeams[0], randomTeams[1]);
              await loadMatches();
            } catch (error) {
              alert('Error creating match');
            }
          }}
          className="admin-btn secondary"
        >
          🎲 Quick Match
        </button>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{ongoingMatches.length}</div>
          <div className="stat-label">Live Matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingMatches.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedMatches.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{matches.length}</div>
          <div className="stat-label">Total Matches</div>
        </div>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚽</div>
          <h3>No Matches Created</h3>
          <p>Create your first match to get started</p>
          <Link to="/admin/create" className="admin-btn primary">
            Create Your First Match
          </Link>
        </div>
      ) : (
        <div className="matches-section">
          {/* Ongoing Matches */}
          {ongoingMatches.length > 0 && (
            <div className="match-category">
              <h3 className="category-title">
                <span className="live-pulse"></span>
                Live Matches ({ongoingMatches.length})
              </h3>
              <div className="admin-matches-grid">
                {ongoingMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onStartMatch={startMatch}
                    onEndMatch={endMatch}
                    onDeleteMatch={deleteMatch}
                    onAddGoal={addGoal}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Matches */}
          {pendingMatches.length > 0 && (
            <div className="match-category">
              <h3 className="category-title">Upcoming Matches ({pendingMatches.length})</h3>
              <div className="admin-matches-grid">
                {pendingMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onStartMatch={startMatch}
                    onEndMatch={endMatch}
                    onDeleteMatch={deleteMatch}
                    onAddGoal={addGoal}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Matches */}
          {completedMatches.length > 0 && (
            <div className="match-category">
              <h3 className="category-title">Completed Matches ({completedMatches.length})</h3>
              <div className="admin-matches-grid">
                {completedMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onStartMatch={startMatch}
                    onEndMatch={endMatch}
                    onDeleteMatch={deleteMatch}
                    onAddGoal={addGoal}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Match Card Component
const MatchCard: React.FC<{
  match: Match;
  onStartMatch: (id: string) => void;
  onEndMatch: (id: string) => void;
  onDeleteMatch: (id: string) => void;
  onAddGoal: (id: string, team: 'A' | 'B') => void;
  actionLoading: string | null;
}> = ({ match, onStartMatch, onEndMatch, onDeleteMatch, onAddGoal, actionLoading }) => {
  const isActionLoading = (action: string) => actionLoading === action;

  return (
    <div className="admin-match-card">
      <div className="match-card-header">
        <div className="match-competition">
          {match.competition || 'Friendly Match'}
        </div>
        <div className={`status-badge ${match.status}`}>
          {match.status === 'ongoing' && '🔴 LIVE'}
          {match.status === 'pending' && '⏰ PENDING'}
          {match.status === 'completed' && '✅ COMPLETED'}
        </div>
      </div>

      <div className="match-teams-score">
        <div className="team-score-row">
          <span className="team-name">{match.teamA}</span>
          <span className="team-score">{match.scoreA}</span>
        </div>
        
        <div className="score-center">
          <div className="score-display">
            {match.scoreA} - {match.scoreB}
          </div>
          <div className="match-venue">{match.venue || 'Stadium'}</div>
        </div>

        <div className="team-score-row">
          <span className="team-score">{match.scoreB}</span>
          <span className="team-name">{match.teamB}</span>
        </div>
      </div>

      <div className="admin-match-actions">
        {match.status === 'pending' && (
          <button 
            onClick={() => onStartMatch(match.id)}
            disabled={isActionLoading(`start-${match.id}`)}
            className="admin-btn success"
          >
            {isActionLoading(`start-${match.id}`) ? '⏳' : '🚀'} Start Match
          </button>
        )}
        
        {match.status === 'ongoing' && (
          <>
            <div className="goal-buttons">
              <button 
                onClick={() => onAddGoal(match.id, 'A')}
                disabled={isActionLoading(`goal-${match.id}-A`)}
                className="admin-btn danger small"
              >
                {isActionLoading(`goal-${match.id}-A`) ? '⏳' : '⚽'} {match.teamA}
              </button>
              <button 
                onClick={() => onAddGoal(match.id, 'B')}
                disabled={isActionLoading(`goal-${match.id}-B`)}
                className="admin-btn danger small"
              >
                {isActionLoading(`goal-${match.id}-B`) ? '⏳' : '⚽'} {match.teamB}
              </button>
            </div>

            <button 
              onClick={() => onEndMatch(match.id)}
              disabled={isActionLoading(`end-${match.id}`)}
              className="admin-btn warning"
            >
              {isActionLoading(`end-${match.id}`) ? '⏳' : '✅'} End Match
            </button>
          </>
        )}

        <div className="action-buttons-row">
          <Link 
            to={`/admin/match/${match.id}`}
            className="admin-btn primary small"
          >
            👀 Details
          </Link>
          <button 
            onClick={() => onDeleteMatch(match.id)}
            disabled={isActionLoading(`delete-${match.id}`)}
            className="admin-btn danger small"
          >
            {isActionLoading(`delete-${match.id}`) ? '⏳' : '🗑️'} Delete
          </button>
        </div>
      </div>

      {match.events.length > 0 && (
        <div className="events-summary">
          <div className="events-title">
            Recent Events ({match.events.length})
          </div>
          <div className="events-list">
            {match.events.slice(-3).map(event => (
              <div key={event.id} className="event-preview">
                <span className="event-minute">{event.minute}'</span>
                <span className="event-icon">
                  {event.type === 'goal' && '⚽'}
                  {event.type === 'yellow_card' && '🟨'}
                  {event.type === 'red_card' && '🟥'}
                </span>
                <span className="event-player">{event.player}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatchList;