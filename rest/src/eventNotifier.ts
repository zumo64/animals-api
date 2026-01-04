import { createClient } from 'redis';
import { Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Create a separate Redis client for subscribing
const subscriber = createClient({ url: process.env.REDIS_URL || 'redis://@localhost:6379' });
subscriber.on('error', err => console.log('Redis Subscriber Error', err));

// Store all connected SSE clients
const sseClients: Set<Response> = new Set();

// Initialize the subscriber
export async function initializeSubscriber() {
  await subscriber.connect();
  console.log('Redis subscriber connected');

  // Subscribe to expired key events
  await subscriber.pSubscribe('__keyevent@0__:expired', (message, channel) => {
    console.log(`Key expired: ${message}`);

    // Check if it's a bear or dog
    if (message === 'bear' || message === 'dog') {
      // Notify all connected SSE clients
      broadcastExpiration(message);
    }
  });

  console.log('Subscribed to Redis key expiration events');
}

// Add a new SSE client
export function addSSEClient(client: Response) {
  sseClients.add(client);
  console.log(`SSE client connected. Total clients: ${sseClients.size}`);

  // Remove client when connection closes
  client.on('close', () => {
    sseClients.delete(client);
    console.log(`SSE client disconnected. Total clients: ${sseClients.size}`);
  });
}

// Broadcast expiration event to all connected clients
function broadcastExpiration(animalType: string) {
  const eventData = JSON.stringify({
    type: 'expiration',
    animalType,
    timestamp: new Date().toISOString()
  });

  console.log(`Broadcasting expiration to ${sseClients.size} clients:`, eventData);

  sseClients.forEach(client => {
    try {
      client.write(`data: ${eventData}\n\n`);
    } catch (error) {
      console.error('Error sending to SSE client:', error);
      sseClients.delete(client);
    }
  });
}
