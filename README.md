markdown
# ⚽ Football Match Tracker

A real-time football match tracking application built with React frontend and Express/TypeScript backend. Features live updates using Event Streams for real-time match data.

![Football Tracker](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Express](https://img.shields.io/badge/Express-4.18-green)

## 🚀 Features

### Admin Features
- Create new football matches between two teams
- Start matches and manage match status
- Add goals and match events in real-time

### User Features
- View live list of ongoing matches with real-time score updates
- Detailed match view with live event streaming
- Real-time goal notifications
- Beautiful, responsive UI with dark theme

### Technical Features
- **Frontend**: React with TypeScript, Vite build tool
- **Backend**: Express.js with TypeScript
- **Real-time Communication**: Server-Sent Events (Event Streams)
- **Styling**: Modern CSS with gradient designs and animations

## 📸 Screenshots

*(Add screenshots of your application here)*

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
Install dependencies:

bash
npm install
Start the development server:

bash
npm run dev
The backend will run on http://localhost:3001

Frontend Setup
Navigate to the frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
Start the development server:

bash
npm run dev
The frontend will run on http://localhost:3000

🎮 Usage
Creating and Managing Matches
Create a Match: Use the "Create Test Match" button in the admin controls

Start a Match: Click "Start Random Match" to begin a match

Add Goals: Use the goal buttons to simulate goals for either team

Viewing Matches
Home Page: View all ongoing matches with live scores

Match Details: Click "View Details" to see detailed match information and events

Real-time Updates: All score and event updates happen in real-time without page refresh

📡 API Endpoints
Admin Endpoints
POST /api/matches/admin/create - Create a new match

POST /api/matches/admin/:matchId/start - Start a match

POST /api/matches/admin/:matchId/goal - Add a goal to a match

User Endpoints
GET /api/matches - Get all matches

GET /api/matches/:matchId - Get match details

Event Streams
GET /api/matches/stream/list - Stream for match list updates

GET /api/matches/:matchId/stream - Stream for specific match updates

🏗️ Project Structure
text
Football-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── types/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
🔧 Technologies Used
Frontend
React 18 - UI library

TypeScript - Type safety

Vite - Build tool and dev server

React Router - Navigation

CSS3 - Styling with modern features

Backend
Express.js - Web framework

TypeScript - Type safety

CORS - Cross-origin resource sharing

UUID - Unique identifier generation

🚀 Deployment

🤝 Contributing


👨‍💻 Author
GitHub: @ruhatrix

🙏 Acknowledgments-> mentor
    Naol Kasinet


Express.js team for the robust backend framework

Vite team for the fast build tool
