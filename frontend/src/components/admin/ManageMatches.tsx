// frontend/src/components/admin/ManageMatches.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';

const ManageMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    // Real-time updates
    const eventSource = new EventSource('http://localhost:3001/api/matches/stream/list');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INITIAL' || data.type === 'GOAL' || data.type === 'MATCH_STARTED') {
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
      alert('Match started!');
    } catch (error) {
      alert('Error starting match');
      console.error(error);
    }
  };

  const addGoal = async (matchId: string, team: 'A' | 'B') => {
    const player = prompt(`Enter player name for goal (Team ${team}):`) || `Player ${team}`;
    try {
      await matchAPI.addGoal(matchId, team, player);
    } catch (error) {
      alert('Error adding goal');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="manage-matches">
      <div className="admin-actions">
        <Link to="/admin/create" className="action-btn primary">
          ➕ Create New Match
        </Link>
      </div>

      <div className="matches-section">
        <h2>All Matches ({matches.length})</h2>
        
        {matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚽</div>
            <h3>No Matches Created</h3>
            <p>Create your first match to get started</p>
          </div>
        ) : (
          <div className="admin-matches-grid">
            {matches.map(match => (
              <div key={match.id} className="admin-match-card">
                <div className="match-header">
                  <div className={`status-badge ${match.status}`}>
                    {match.status.toUpperCase()}
                  </div>
                  <div className="match-id">ID: {match.id.slice(0, 8)}...</div>
                </div>

                <div className="teams-score-display">
                  <div className="team-left">
                    <div className="team-name">{match.teamA}</div>
                    <div className="team-score">{match.scoreA}</div>
                  </div>

                  <div className="score-center">
                    <div className="score-divider">:</div>
                  </div>

                  <div className="team-right">
                    <div className="team-score">{match.scoreB}</div>
                    <div className="team-name">{match.teamB}</div>
                  </div>
                </div>

                <div className="match-actions-admin">
                  {match.status === 'pending' && (
                    <button 
                      onClick={() => startMatch(match.id)}
                      className="action-btn success"
                    >
                      🚀 Start Match
                    </button>
                  )}
                  
                  {match.status === 'ongoing' && (
                    <div className="goal-buttons">
                      <button 
                        onClick={() => addGoal(match.id, 'A')}
                        className="action-btn goal"
                      >
                        ⚽ Goal for {match.teamA}
                      </button>
                      <button 
                        onClick={() => addGoal(match.id, 'B')}
                        className="action-btn goal"
                      >
                        ⚽ Goal for {match.teamB}
                      </button>
                    </div>
                  )}

                  <Link 
                    to={`/user/match/${match.id}`} 
                    className="action-btn secondary"
                  >
                    👀 View as User
                  </Link>
                </div>

                <div className="match-events">
                  <div className="events-title">Events ({match.events.length})</div>
                  <div className="events-list">
                    {match.events.slice(-5).map(event => (
                      <div key={event.id} className={`event-item ${event.type}`}>
                        <span className="event-minute">{event.minute}'</span>
                        <span className="event-type">{event.type}</span>
                        <span className="event-player">{event.player}</span>
                      </div>
                    ))}
                    {match.events.length === 0 && (
                      <div className="no-events">No events yet</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMatches;