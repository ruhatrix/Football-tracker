// frontend/src/components/user/MatchDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Match, MatchEvent } from '../../types';
import { matchAPI } from '../../services/api';

const MatchDetail: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'lineups'>('timeline');

  useEffect(() => {
    if (!matchId) return;

    loadMatchDetails();
    
    const eventSource = new EventSource(`http://localhost:3001/api/matches/${matchId}/stream`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'INITIAL') {
          setMatch(data.match);
        } else if (data.type === 'GOAL') {
          setMatch(data.match);
          showGoalNotification(data.event, data.match);
        } else if (data.type === 'MATCH_STARTED' || data.type === 'MATCH_ENDED') {
          setMatch(data.match);
        } else if (data.type === 'CARD' || data.type === 'FOUL') {
          setMatch(data.match);
        }
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    return () => eventSource.close();
  }, [matchId]);

  const loadMatchDetails = async () => {
    if (!matchId) return;
    try {
      const matchData = await matchAPI.getMatchDetails(matchId);
      setMatch(matchData);
    } catch (error) {
      console.error('Error loading match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const showGoalNotification = (event: MatchEvent, match: Match) => {
    const teamName = event.team === 'A' ? match.teamA : match.teamB;
    const notification = document.createElement('div');
    notification.className = 'goal-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">⚽</div>
        <div class="notification-text">
          <div class="notification-title">GOAL!</div>
          <div class="notification-player">${event.player}</div>
          <div class="notification-details">${teamName} • ${event.minute}'</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading match details...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail">
        <Link to="/user" className="back-btn">← Back to Matches</Link>
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h3>Match Not Found</h3>
          <p>The match you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const goals = match.events.filter(e => e.type === 'goal');
  const cards = match.events.filter(e => e.type === 'yellow_card' || e.type === 'red_card');
  const fouls = match.events.filter(e => e.type === 'foul');

  return (
    <div className="match-detail">
      <Link to="/user" className="back-btn">← Back to Matches</Link>
      
      {/* Match Header */}
      <div className="detail-header">
        <div className="match-info-top">
          <div className="competition">{match.competition}</div>
          <div className="venue">🏟️ {match.venue}</div>
        </div>

        <div className="detail-teams">
          <div className="detail-team home-team">
            <div className="team-logo-large">
              {getTeamAbbreviation(match.teamA)}
            </div>
            <div className="team-name-large">{match.teamA}</div>
            <div className="team-score-large">{match.scoreA}</div>
          </div>

          <div className="match-center-detail">
            <div className="score-large">
              {match.scoreA} - {match.scoreB}
            </div>
            <div className="match-status-large">
              {match.status === 'ongoing' ? (
                <div className="live-indicator-large">
                  <span className="pulse"></span>
                  LIVE
                </div>
              ) : (
                <div className={`status-text-large ${match.status}`}>
                  {match.status.toUpperCase()}
                </div>
              )}
            </div>
            <div className="match-time-large">
              {match.startTime ? 
                `Started ${new Date(match.startTime).toLocaleString()}` : 
                'Not Started'
              }
            </div>
          </div>

          <div className="detail-team away-team">
            <div className="team-logo-large">
              {getTeamAbbreviation(match.teamB)}
            </div>
            <div className="team-name-large">{match.teamB}</div>
            <div className="team-score-large">{match.scoreB}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="stat-icon">⚽</div>
            <div className="stat-value">{goals.length}</div>
            <div className="stat-label">Goals</div>
          </div>
          <div className="quick-stat">
            <div className="stat-icon">🟨</div>
            <div className="stat-value">{cards.filter(c => c.type === 'yellow_card').length}</div>
            <div className="stat-label">Yellows</div>
          </div>
          <div className="quick-stat">
            <div className="stat-icon">🟥</div>
            <div className="stat-value">{cards.filter(c => c.type === 'red_card').length}</div>
            <div className="stat-label">Reds</div>
          </div>
          <div className="quick-stat">
            <div className="stat-icon">🤕</div>
            <div className="stat-value">{fouls.length}</div>
            <div className="stat-label">Fouls</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <span className="tab-icon">🕒</span>
          Match Timeline
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="tab-icon">📊</span>
          Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lineups' ? 'active' : ''}`}
          onClick={() => setActiveTab('lineups')}
        >
          <span className="tab-icon">👥</span>
          Lineups
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'timeline' && <TimelineTab match={match} />}
        {activeTab === 'stats' && <StatsTab match={match} />}
        {activeTab === 'lineups' && <LineupsTab match={match} />}
      </div>
    </div>
  );
};

// Tab Components
const TimelineTab: React.FC<{ match: Match }> = ({ match }) => (
  <div className="timeline-tab">
    <h3 className="section-title">Match Events Timeline</h3>
    
    {match.events.length === 0 ? (
      <div className="empty-timeline">
        <div className="empty-icon">⏳</div>
        <h4>No Events Yet</h4>
        <p>Match events will appear here as the game progresses.</p>
      </div>
    ) : (
      <div className="events-timeline">
        {match.events
          .sort((a, b) => a.minute - b.minute)
          .map(event => (
            <div key={event.id} className="timeline-event">
              <div className="event-time-badge">{event.minute}'</div>
              <div className={`event-card event-${event.type}`}>
                <div className="event-header">
                  <div className="event-type-icon">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="event-type-name">
                    {getEventTypeText(event.type)}
                  </div>
                  <div className="event-team">
                    {event.team === 'A' ? match.teamA : match.teamB}
                  </div>
                </div>
                <div className="event-player">{event.player}</div>
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
                <div className="event-timestamp">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
);

const StatsTab: React.FC<{ match: Match }> = ({ match }) => {
  const goals = match.events.filter(e => e.type === 'goal');
  const cards = match.events.filter(e => e.type === 'yellow_card' || e.type === 'red_card');
  const fouls = match.events.filter(e => e.type === 'foul');

  return (
    <div className="stats-tab">
      <div className="stats-grid">
        <div className="stat-card large">
          <h4>Goals Breakdown</h4>
          <div className="goals-comparison">
            <div className="team-goals">
              <div className="team-name">{match.teamA}</div>
              <div className="goals-bar">
                <div 
                  className="goals-fill home-goals"
                  style={{ width: `${(match.scoreA / Math.max(match.scoreA + match.scoreB, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="goals-count">{match.scoreA}</div>
            </div>
            <div className="team-goals">
              <div className="team-name">{match.teamB}</div>
              <div className="goals-bar">
                <div 
                  className="goals-fill away-goals"
                  style={{ width: `${(match.scoreB / Math.max(match.scoreA + match.scoreB, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="goals-count">{match.scoreB}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Discipline</h4>
          <div className="cards-stats">
            <div className="card-stat">
              <span className="card-icon yellow">🟨</span>
              <span className="card-count">
                {cards.filter(c => c.type === 'yellow_card').length}
              </span>
              <span className="card-label">Yellow Cards</span>
            </div>
            <div className="card-stat">
              <span className="card-icon red">🟥</span>
              <span className="card-count">
                {cards.filter(c => c.type === 'red_card').length}
              </span>
              <span className="card-label">Red Cards</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Match Info</h4>
          <div className="match-info-list">
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`info-value ${match.status}`}>
                {match.status.toUpperCase()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Venue:</span>
              <span className="info-value">{match.venue}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Competition:</span>
              <span className="info-value">{match.competition}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Started:</span>
              <span className="info-value">
                {match.startTime ? new Date(match.startTime).toLocaleString() : 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LineupsTab: React.FC<{ match: Match }> = ({ match }) => (
  <div className="lineups-tab">
    <div className="lineups-container">
      <div className="team-lineup">
        <h4>{match.teamA}</h4>
        <div className="formation">Formation: 4-3-3</div>
        <div className="lineup-players">
          {generateLineup(match.teamA).map((player, index) => (
            <div key={index} className="lineup-player">
              <span className="player-number">{index + 1}</span>
              <span className="player-name">{player}</span>
              <span className="player-position">
                {getPlayerPosition(index)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pitch-divider">
        <div className="pitch-center-circle"></div>
      </div>

      <div className="team-lineup">
        <h4>{match.teamB}</h4>
        <div className="formation">Formation: 4-4-2</div>
        <div className="lineup-players">
          {generateLineup(match.teamB).map((player, index) => (
            <div key={index} className="lineup-player">
              <span className="player-number">{index + 1}</span>
              <span className="player-name">{player}</span>
              <span className="player-position">
                {getPlayerPosition(index)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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

function getEventTypeText(type: string): string {
  switch (type) {
    case 'goal': return 'GOAL';
    case 'yellow_card': return 'YELLOW CARD';
    case 'red_card': return 'RED CARD';
    case 'foul': return 'FOUL';
    case 'penalty': return 'PENALTY';
    case 'substitution': return 'SUBSTITUTION';
    default: return type.toUpperCase();
  }
}

function generateLineup(teamName: string): string[] {
  const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Taylor'];
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
  
  return Array.from({ length: 11 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const surname = surnames[index % surnames.length];
    return `${firstName} ${surname}`;
  });
}

function getPlayerPosition(index: number): string {
  if (index === 0) return 'GK';
  if (index < 5) return 'DEF';
  if (index < 9) return 'MID';
  return 'FWD';
}

export default MatchDetail;