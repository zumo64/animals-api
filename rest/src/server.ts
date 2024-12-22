import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import animalsRouter from './animals';
import path from 'path';


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


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

