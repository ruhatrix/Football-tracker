import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';

const AdminMatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    const eventSource = new EventSource('http://localhost:3001/api/matches/stream/list');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (['INITIAL', 'GOAL', 'MATCH_STARTED', 'MATCH_ENDED'].includes(data.type)) {
          loadMatches();
        }
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  const loadMatches = async () => {
    try {
      const allMatches = await matchAPI.getMatches();
      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const startMatch = async (matchId: string) => {
    try {
      await matchAPI.startMatch(matchId);
    } catch (error) {
      alert('Error starting match');
      console.error(error);
    }
  };

  const endMatch = async (matchId: string) => {
    try {
      await matchAPI.endMatch(matchId);
    } catch (error) {
      alert('Error ending match');
      console.error(error);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (confirm('Are you sure you want to delete this match?')) {
      try {
        await matchAPI.deleteMatch(matchId);
        loadMatches();
      } catch (error) {
        alert('Error deleting match');
        console.error(error);
      }
    }
  };

  const addGoal = async (matchId: string, team: 'A' | 'B') => {
    const player = prompt(`Enter player name for goal (Team ${team}):`) || `Player ${team}`;
    const description = prompt('Goal description (optional):');
    try {
      await matchAPI.addGoal(matchId, team, player, description);
    } catch (error) {
      alert('Error adding goal');
      console.error(error);
    }
  };

  const addCard = async (matchId: string, team: 'A' | 'B', cardType: 'yellow_card' | 'red_card') => {
    const player = prompt(`Enter player name for card (Team ${team}):`) || `Player ${team}`;
    const description = prompt('Card description (optional):');
    try {
      await matchAPI.addCard(matchId, team, cardType, player, description);
    } catch (error) {
      alert('Error adding card');
      console.error(error);
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

  return (
    <div className="admin-match-list">
      {/* Header */}
      <div className="admin-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="admin-subtitle">Manage matches and track live events</p>
      </div>

      {/* Admin Actions */}
      <div className="admin-actions">
        <Link to="/admin/create" className="admin-btn primary">
          ➕ Create New Match
        </Link>
        <button 
          onClick={() => {
            const teams = [
              ['Arsenal', 'Chelsea'],
              ['Manchester United', 'Liverpool'],
              ['Barcelona', 'Real Madrid'],
              ['Bayern Munich', 'Borussia Dortmund']
            ];
            const randomTeams = teams[Math.floor(Math.random() * teams.length)];
            matchAPI.createMatch(randomTeams[0], randomTeams[1], 'Stadium', 'Friendly Match');
          }}
          className="admin-btn secondary"
        >
          🎲 Quick Match
        </button>
      </div>

      {/* Matches Grid */}
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
        <div className="admin-matches-grid">
          {matches.map(match => (
            <div key={match.id} className="admin-match-card">
              {/* Match Header */}
              <div className="match-card-header">
                <div className="match-competition">
                  {match.competition}
                </div>
                <div className={`status-badge ${match.status}`}>
                  {match.status.toUpperCase()}
                </div>
              </div>

              {/* Match ID */}
              <div className="match-id">
                ID: {match.id.slice(0, 8)}...
              </div>

              {/* Teams and Score */}
              <div className="match-teams-score">
                <div className="team-score-row">
                  <span className="team-name">{match.teamA}</span>
                  <span className="team-score">{match.scoreA}</span>
                </div>
                
                <div className="score-center">
                  <div className="score-display">
                    {match.scoreA} - {match.scoreB}
                  </div>
                </div>

                <div className="team-score-row">
                  <span className="team-score">{match.scoreB}</span>
                  <span className="team-name">{match.teamB}</span>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="admin-match-actions">
                {match.status === 'pending' && (
                  <button 
                    onClick={() => startMatch(match.id)}
                    className="admin-btn success"
                  >
                    🚀 Start Match
                  </button>
                )}
                
                {match.status === 'ongoing' && (
                  <div className="goal-buttons">
                    <button 
                      onClick={() => addGoal(match.id, 'A')}
                      className="admin-btn danger small"
                    >
                      ⚽ {match.teamA}
                    </button>
                    <button 
                      onClick={() => addGoal(match.id, 'B')}
                      className="admin-btn danger small"
                    >
                      ⚽ {match.teamB}
                    </button>
                  </div>
                )}

                {match.status === 'ongoing' && (
                  <div className="card-buttons">
                    <button 
                      onClick={() => addCard(match.id, 'A', 'yellow_card')}
                      className="admin-btn warning small"
                    >
                      🟨 {match.teamA}
                    </button>
                    <button 
                      onClick={() => addCard(match.id, 'B', 'yellow_card')}
                      className="admin-btn warning small"
                    >
                      🟨 {match.teamB}
                    </button>
                  </div>
                )}

                {match.status === 'ongoing' && (
                  <button 
                    onClick={() => endMatch(match.id)}
                    className="admin-btn secondary"
                  >
                    ✅ End Match
                  </button>
                )}

                <div className="action-buttons-row">
                  <Link 
                    to={`/user/match/${match.id}`}
                    className="admin-btn primary small"
                  >
                    👀 View
                  </Link>
                  <button 
                    onClick={() => deleteMatch(match.id)}
                    className="admin-btn danger small"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Events Summary */}
              {match.events.length > 0 && (
                <div className="events-summary">
                  <div className="events-title">
                    Recent Events ({match.events.length})
                  </div>
                  <div className="events-list">
                    {match.events.slice(-3).map(event => (
                      <div key={event.id} className="event-preview">
                        <span className="event-minute">{event.minute}'</span>
                        <span className="event-icon">{getEventIcon(event.type)}</span>
                        <span className="event-player">{event.player}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{matches.filter(m => m.status === 'ongoing').length}</div>
          <div className="stat-label">Live</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{matches.filter(m => m.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{matches.filter(m => m.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{matches.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getEventIcon(type: string): string {
  switch (type) {
    case 'goal': return '⚽';
    case 'yellow_card': return '🟨';
    case 'red_card': return '🟥';
    case 'foul': return '🤕';
    case 'penalty': return '🎯';
    case 'substitution': return '🔄';
    default: return '📌';
  }
}

export default AdminMatchList;