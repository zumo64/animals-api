import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import animalsRouter from './animalsRouter';
import path from 'path';
import { initializeSubscriber, addSSEClient } from './eventNotifier';


dotenv.config();

const app: Application = express();
const PORT = process.env.REST_API_PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Sample REST API!');
});

// Animal Routes
app.use('/animals/', animalsRouter);


// Simple UI
app.get('/ui', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/ui.html'))
});

// SSE endpoint for redis Cache expiry notifications
app.get('/events', (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send a comment to establish connection
  res.write(':connected\n\n');

  // Add this client to the SSE client list
  addSSEClient(res);

  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000); // Every 30 seconds

  // Clean up on close
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Initialize Redis subscriber for key expiration events
  await initializeSubscriber();
});

