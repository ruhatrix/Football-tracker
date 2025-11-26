⚽ Football Match Tracker

A simple real-time football match tracking system built using Express.js (backend) and React (frontend).
Live updates are delivered using Event Streams (Server-Sent Events — SSE).

🎯 Goal

Enable admins to create and start football matches, while users can view live match updates (goals, cards, fouls, etc.) streamed in real time.

✅ Features
👨‍💼 Admin Features

Create a match with two teams.

Start a created match.
(No authentication required for this project.)

👥 User Features
🔹 Match List Page

Displays a list of all ongoing (started) matches.

Shows live goal updates using Event Streams (SSE).

Each match includes a “View Details” button.

🔹 Match Detail Page

Displays real-time updates for only the selected match.

Live updates include:

Goals

Cards (optional)

Fouls or other simple match events (optional)

Updates are streamed using SSE.

🎯 Acceptance Criteria

Admin Endpoints

Endpoint exists to create a match.

Endpoint exists to start a match.

No authentication required.

Match List (User Page)

Displays all started matches.

Goal counts update in real time using Event Streams.

Match Detail Page

Receives only updates from the selected match.

Shows live events (goals + optional events such as cards/fouls).
