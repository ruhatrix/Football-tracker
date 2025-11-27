// frontend/src/components/user/MatchList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import { matchAPI } from '../../services/api';

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    const eventSource = new EventSource('http://localhost:3001/api/matches/stream/list');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INITIAL' || data.type === 'GOAL' || data.type === 'MATCH_STARTED' || data.type === 'MATCH_ENDED') {
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

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing': return '🔴 LIVE';
      case 'completed': return '✅ Finished';
      case 'pending': return '⏰ Upcoming';
      default: return '';
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
    <div className="match-list">
      <div className="page-header">
        <h1 className="page-title">Football Matches</h1>
        <p className="page-subtitle">Live scores and real-time updates</p>
      </div>

     {/* Filter Tabs */}
<div className="filter-section">
  <div className="filter-header">
    <h3 className="filter-title">Filter Matches</h3>
    <div className="filter-stats">
      <span className="filter-count">{filteredMatches.length} matches</span>
    </div>
  </div>
  
  <div className="filter-tabs-container">
    <div className="filter-tabs">
      {(['all', 'ongoing', 'pending', 'completed'] as const).map(tab => (
        <button
          key={tab}
          className={`filter-tab ${filter === tab ? 'active' : ''}`}
          onClick={() => setFilter(tab)}
        >
          <span className="tab-icon">
            {tab === 'all' && '🏆'}
            {tab === 'ongoing' && '🔴'}
            {tab === 'pending' && '⏰'}
            {tab === 'completed' && '✅'}
          </span>
          <span className="tab-label">
            {tab === 'all' && 'All Matches'}
            {tab === 'ongoing' && 'Live Now'}
            {tab === 'pending' && 'Upcoming'}
            {tab === 'completed' && 'Completed'}
          </span>
          <span className="tab-badge">
            {tab === 'all' && matches.length}
            {tab === 'ongoing' && matches.filter(m => m.status === 'ongoing').length}
            {tab === 'pending' && matches.filter(m => m.status === 'pending').length}
            {tab === 'completed' && matches.filter(m => m.status === 'completed').length}
          </span>
        </button>
      ))}
    </div>
    
    {/* Active Filter Indicator */}
    <div className="filter-indicator">
      <div className="indicator-dot"></div>
      <span className="indicator-text">
        Showing {filter === 'all' ? 'all' : filter} matches
      </span>
    </div>
  </div>
</div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {filter === 'ongoing' ? '🔴' : filter === 'completed' ? '✅' : '⚽'}
          </div>
          <h3>
            {filter === 'all' && 'No Matches Available'}
            {filter === 'ongoing' && 'No Live Matches'}
            {filter === 'pending' && 'No Upcoming Matches'}
            {filter === 'completed' && 'No Completed Matches'}
          </h3>
          <p>
            {filter === 'all' && 'Check back later for new matches'}
            {filter === 'ongoing' && 'Matches will appear here when they start'}
            {filter === 'pending' && 'New matches will be scheduled soon'}
            {filter === 'completed' && 'Completed matches will appear here'}
          </p>
        </div>
      ) : (
        <div className="matches-grid">
          {filteredMatches.map(match => (
            <div key={match.id} className={`match-card ${match.status}`}>
              <div className="match-header">
                <div className="match-competition">
                  {match.competition || 'Friendly Match'}
                </div>
                <div className="match-status">
                  {getMatchStatusIcon(match.status)}
                </div>
              </div>

              <div className="match-venue">
                <span className="venue-icon">🏟️</span>
                {match.venue || 'Stadium'}
              </div>

              <div className="teams-score-display">
                <div className="team home-team">
                  <div className="team-logo">
                    {getTeamAbbreviation(match.teamA)}
                  </div>
                  <div className="team-name">{match.teamA}</div>
                  <div className="team-score">{match.scoreA}</div>
                </div>

                <div className="match-center">
                  <div className="score">
                    {match.scoreA} - {match.scoreB}
                  </div>
                  <div className="match-time">
                    {match.startTime ? new Date(match.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'TBD'}
                  </div>
                </div>

                <div className="team away-team">
                  <div className="team-logo">
                    {getTeamAbbreviation(match.teamB)}
                  </div>
                  <div className="team-name">{match.teamB}</div>
                  <div className="team-score">{match.scoreB}</div>
                </div>
              </div>

              {/* Recent Events */}
              {match.events.length > 0 && (
                <div className="recent-events">
                  <div className="events-title">Recent Events</div>
                  <div className="events-preview">
                    {match.events.slice(-2).map(event => (
                      <div key={event.id} className={`event-preview ${event.type}`}>
                        <span className="event-minute">{event.minute}'</span>
                        <span className="event-type">{getEventIcon(event.type)}</span>
                        <span className="event-player">{event.player}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="match-actions">
                <Link to={`/user/match/${match.id}`} className="view-details-btn">
                  <span>View Match Details</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {/* <div className="stats-footer">
        <div className="stat-item">
          <div className="stat-number">{matches.filter(m => m.status === 'ongoing').length}</div>
          <div className="stat-label">Live Now</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{matches.filter(m => m.status === 'pending').length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{matches.filter(m => m.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{matches.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div> */}
    </div>
  );
};

// Helper functions
function getTeamAbbreviation(teamName: string): string {
  return teamName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
}

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

export default MatchList;