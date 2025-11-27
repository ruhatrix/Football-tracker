import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../../services/api';

const CreateMatch: React.FC = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [venue, setVenue] = useState('Main Stadium');
  const [competition, setCompetition] = useState('Friendly Match');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim()) {
      alert('Please enter both team names');
      return;
    }

    setLoading(true);
    try {
      await matchAPI.createMatch(teamA.trim(), teamB.trim(), venue, competition);
      alert(`✅ Match created: ${teamA} vs ${teamB}`);
      navigate('/admin');
    } catch (error) {
      alert('Error creating match');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createQuickMatch = (team1: string, team2: string) => {
    setTeamA(team1);
    setTeamB(team2);
  };

  const popularMatchups = [
    ['Arsenal', 'Chelsea'],
    ['Manchester United', 'Liverpool'],
    ['Barcelona', 'Real Madrid'],
    ['Bayern Munich', 'Borussia Dortmund'],
    ['PSG', 'Marseille'],
    ['Juventus', 'AC Milan'],
    ['Manchester City', 'Tottenham'],
    ['Atletico Madrid', 'Sevilla']
  ];

  return (
    <div className="create-match-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Create New Match</h1>
        <p className="page-subtitle">Set up a new football match</p>
      </div>

      {/* Create Match Form */}
      <div className="create-match-form">
        <form onSubmit={handleSubmit}>
          {/* Team Inputs */}
          <div className="form-row">
            <div className="form-group">
              <label>Team A</label>
              <input
                type="text"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="Enter Team A name (e.g., Arsenal)"
                required
              />
            </div>

            <div className="vs-divider">VS</div>

            <div className="form-group">
              <label>Team B</label>
              <input
                type="text"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="Enter Team B name (e.g., Chelsea)"
                required
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Venue</label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              >
                <option value="Main Stadium">Main Stadium</option>
                <option value="Wembley Stadium">Wembley Stadium</option>
                <option value="Old Trafford">Old Trafford</option>
                <option value="Camp Nou">Camp Nou</option>
                <option value="Allianz Arena">Allianz Arena</option>
                <option value="San Siro">San Siro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Competition</label>
              <select
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
              >
                <option value="Friendly Match">Friendly Match</option>
                <option value="Premier League">Premier League</option>
                <option value="Champions League">Champions League</option>
                <option value="La Liga">La Liga</option>
                <option value="Bundesliga">Bundesliga</option>
                <option value="Serie A">Serie A</option>
                <option value="World Cup">World Cup</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn primary large"
          >
            {loading ? (
              <div className="loading-btn">
                <div className="spinner-small"></div>
                <span>Creating Match...</span>
              </div>
            ) : (
              'Create Match'
            )}
          </button>
        </form>
      </div>

      {/* Quick Matchups */}
      <div className="quick-matchups">
        <h3>⚡ Quick Matchups</h3>
        <div className="matchups-grid">
          {popularMatchups.map(([team1, team2], index) => (
            <button
              key={index}
              type="button"
              onClick={() => createQuickMatch(team1, team2)}
              className="quick-match-btn"
            >
              <div className="team-name">{team1}</div>
              <div className="vs-text">VS</div>
              <div className="team-name">{team2}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="back-section">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="back-btn"
        >
          ← Back to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default CreateMatch;