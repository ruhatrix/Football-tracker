import express from 'express';
import cors from 'cors';
import matchRoutes from './routes/matches';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Vite default port
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/matches', matchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});