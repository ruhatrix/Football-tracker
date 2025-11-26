import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types';
import { matchAPI } from '../services/api';

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    matchAPI.getMatches().then(matches => {
      setMatches(matches);
      setLoading(false);
    });

    // Setup EventSource for real-time updates
    const eventSource = new EventSource('http://localhost:3001/api/matches/stream/list');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'INITIAL') {
          setMatches(data.matches);
        } else if (data.type === 'GOAL' || data.type === 'MATCH_STARTED') {
          setMatches(prev => 
            prev.map(match => 
              match.id === data.match.id ? data.match : match
            )
          );
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
  }, []);

  const createTestMatch = async () => {
    const teams = [
      ['Barcelona', 'Real Madrid'],
      ['Manchester United', 'Liverpool'],
      ['Bayern Munich', 'Borussia Dortmund'],
      ['PSG', 'Marseille'],
      ['Juventus', 'AC Milan']
    ];
    
    const randomTeams = teams[Math.floor(Math.random() * teams.length)];
    const match = await matchAPI.createMatch(randomTeams[0], randomTeams[1]);
    alert(`🎉 Match created: ${randomTeams[0]} vs ${randomTeams[1]}`);
  };

  const startRandomMatch = async () => {
    const pendingMatches = matches.filter(m => m.status === 'pending');
    if (pendingMatches.length > 0) {
      const randomMatch = pendingMatches[Math.floor(Math.random() * pendingMatches.length)];
      await matchAPI.startMatch(randomMatch.id);
      alert(`⚽ Match started: ${randomMatch.teamA} vs ${randomMatch.teamB}`);
    } else {
      alert('No pending matches available. Create a match first.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="match-list">
      <div className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            <div className="logo-icon">⚽</div>
            Football Tracker Live
          </Link>
          <div className="live-badge">
            <span>LIVE</span>
          </div>
        </nav>
      </div>

      <h1 className="page-title">Live Matches</h1>
      
      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚽</div>
          <h3>No Live Matches</h3>
          <p>Create a match to get started with live tracking</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map(match => (
            <div key={match.id} className={`match-card ${match.status === 'ongoing' ? 'live' : ''}`}>
              <div className="match-header">
                <div className="match-status">
                  {match.status === 'ongoing' && (
                    <div className="live-badge">
                      <span>LIVE</span>
                    </div>
                  )}
                  {match.status === 'pending' && (
                    <span style={{color: '#94a3b8', fontWeight: 600}}>UPCOMING</span>
                  )}
                </div>
                <div className="match-time">
                  {match.startTime ? 'Started' : 'Not started'}
                </div>
              </div>

              <div className="teams-display">
                <div className="team">
                  <div className="team-logo">
                    {match.teamA.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="team-name">{match.teamA}</div>
                </div>

                <div className="score-display">
                  <div className="score">
                    {match.scoreA} - {match.scoreB}
                  </div>
                </div>

                <div className="team">
                  <div className="team-logo">
                    {match.teamB.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="team-name">{match.teamB}</div>
                </div>
              </div>

              <div className="match-actions">
                <Link to={`/match/${match.id}`} className="view-details-btn">
                  <span>View Details</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Controls */}
      <div className="admin-controls">
        <h3 className="controls-title">🎮 Admin Controls</h3>
        <div className="controls-grid">
          <button onClick={createTestMatch} className="control-btn create">
            <span>➕</span>
            Create Test Match
          </button>
          <button onClick={startRandomMatch} className="control-btn start">
            <span>⚽</span>
            Start Random Match
          </button>
          <button 
            onClick={async () => {
              const ongoingMatches = matches.filter(m => m.status === 'ongoing');
              if (ongoingMatches.length > 0) {
                const randomMatch = ongoingMatches[Math.floor(Math.random() * ongoingMatches.length)];
                const randomTeam = Math.random() > 0.5 ? 'A' : 'B';
                await matchAPI.addGoal(randomMatch.id, randomTeam, `Player ${randomTeam}`);
                alert(`🎯 Goal added to ${randomTeam === 'A' ? randomMatch.teamA : randomMatch.teamB}`);
              } else {
                alert('No ongoing matches available.');
              }
            }}
            className="control-btn goal"
          >
            <span>🎯</span>
            Add Random Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchList;