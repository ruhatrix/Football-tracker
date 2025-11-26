import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Match, MatchEvent } from '../types';
import { matchAPI } from '../services/api';

const MatchDetail: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    // Initial fetch
    matchAPI.getMatchDetails(matchId).then(matchData => {
      setMatch(matchData);
      setLoading(false);
    });

    // Setup EventSource for real-time updates
    const eventSource = new EventSource(`http://localhost:3001/api/matches/${matchId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'INITIAL') {
          setMatch(data.match);
        } else if (data.type === 'GOAL') {
          setMatch(data.match);
          
          // Show goal notification
          const event = data.event as MatchEvent;
          const teamName = event.team === 'A' ? data.match.teamA : data.match.teamB;
          
          // Create a nice notification
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.5s ease;
          `;
          notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.5rem;">⚽</span>
              <div>
                <div style="font-size: 1.1rem;">GOAL!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${event.player} - ${teamName}</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        } else if (data.type === 'MATCH_STARTED') {
          setMatch(data.match);
        }
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail">
        <Link to="/" className="back-btn">← Back to Matches</Link>
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h3>Match Not Found</h3>
          <p>The match you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-detail">
      <Link to="/" className="back-btn">← Back to Matches</Link>
      
      <div className="detail-header">
        <div className="detail-teams">
          <div className="detail-team">
            <div className="detail-team-logo">
              {match.teamA.split(' ').map(word => word[0]).join('')}
            </div>
            <div className="detail-team-name">{match.teamA}</div>
          </div>

          <div className="detail-score">
            {match.scoreA} - {match.scoreB}
          </div>

          <div className="detail-team">
            <div className="detail-team-logo">
              {match.teamB.split(' ').map(word => word[0]).join('')}
            </div>
            <div className="detail-team-name">{match.teamB}</div>
          </div>
        </div>

        <div className="match-info">
          <div className="info-item">
            <span>📊</span>
            <span>Status: <strong>{match.status.toUpperCase()}</strong></span>
          </div>
          <div className="info-item">
            <span>⏰</span>
            <span>Started: {match.startTime ? new Date(match.startTime).toLocaleTimeString() : 'Not started'}</span>
          </div>
          <div className="info-item">
            <span>🎯</span>
            <span>Events: {match.events.length}</span>
          </div>
        </div>
      </div>

      <div className="events-section">
        <h3 className="section-title">
          <span>📋</span>
          Match Events
        </h3>
        
        {match.events.length === 0 ? (
          <div className="empty-state" style={{padding: '2rem'}}>
            <div className="empty-icon">⏳</div>
            <p>No events yet. Events will appear here as the match progresses.</p>
          </div>
        ) : (
          <div className="events-timeline">
            {match.events.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-time">{event.minute}'</div>
                <div className={`event-content event-${event.type}`}>
                  <div className="event-type">
                    {getEventIcon(event.type)}
                    {getEventTypeText(event.type)}
                  </div>
                  <div className="event-player">
                    {event.player} - {event.team === 'A' ? match.teamA : match.teamB}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Controls */}
      <div className="admin-controls">
        <h3 className="controls-title">🎮 Match Controls</h3>
        <div className="controls-grid">
          {match.status === 'pending' && (
            <button 
              onClick={async () => {
                await matchAPI.startMatch(match.id);
                alert('⚽ Match started!');
              }}
              className="control-btn start"
            >
              <span>🚀</span>
              Start Match
            </button>
          )}
          <button 
            onClick={async () => {
              await matchAPI.addGoal(match.id, 'A', `Player ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
            }}
            className="control-btn goal"
          >
            <span>🎯</span>
            Goal for {match.teamA}
          </button>
          <button 
            onClick={async () => {
              await matchAPI.addGoal(match.id, 'B', `Player ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
            }}
            className="control-btn goal"
          >
            <span>🎯</span>
            Goal for {match.teamB}
          </button>
        </div>
      </div>
    </div>
  );
};

function getEventIcon(type: string): string {
  switch (type) {
    case 'goal': return '⚽';
    case 'yellow_card': return '🟨';
    case 'red_card': return '🟥';
    case 'foul': return '🤕';
    default: return '📌';
  }
}

function getEventTypeText(type: string): string {
  switch (type) {
    case 'goal': return 'GOAL';
    case 'yellow_card': return 'YELLOW CARD';
    case 'red_card': return 'RED CARD';
    case 'foul': return 'FOUL';
    default: return type.toUpperCase();
  }
}

export default MatchDetail;