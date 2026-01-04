import { Router, Request, Response } from 'express';
import axios from 'axios';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({url: process.env.REDIS_URL || 'redis://@localhost:6379'});
client.on('error', err => console.log('Redis Client Error', err));


(async () => {
  await client.connect();
  console.log("connected to redis");
  await client.configSet('notify-keyspace-events', 'Ex');
  console.log("Redis keyspace notifications enabled");
})(); 


const urls: Record<string, string> = {
  bear:"https://placebear.com/g/200/300",
  dog:"https://place.dog/200/300",
};



const router = Router();


// Fetch an animal of type bear or dog
router.get('/fetch/:type', async (req: Request, res: Response) => {
  const animal_type = req.params.type;
  const animal_id = req.query.id;

  // Get TTL from query parameter, default to 30 seconds
  const ttl = req.query.ttl ? parseInt(req.query.ttl as string, 10) : 30;
  const cacheTTL = isNaN(ttl) || ttl < 1 ? 30 : ttl;

  console.log("fetching an animal type "+animal_type+" with TTL "+cacheTTL);
  if  (!(animal_type  in  urls)) {
    console.log("not supported animal  type "+animal_type);
    res.status(404).json({ message: 'animal not supported' });
    return;
  }

  
  //look in the cache for an existing picture
  const image = await client.get(animal_type);

  if (image == null) {
    console.log("animal type "+animal_type +" not found in cache - fecthing from place API");
    // Make a GET request to the Bear / Dog Place service
    const binaryData = await fetchImage(urls[animal_type]);

    // Store the image in Redis Cache with TTL
    client.set(animal_type, Buffer.from(binaryData).toString('base64'), { EX: cacheTTL });

    // Set response
    res.set({'Content-Type': 'image/jpeg'});
    res.end(binaryData,'binary');

  }
  else  {
    console.log("image for animal type "+animal_type +"  found in cache");
    res.set({'Content-Type': 'image/jpeg'});
    res.end(Buffer.from(image, 'base64'),'binary');
  }

  
  async function fetchImage(imageurl: string): Promise<Buffer> {
    try {
      // Fetch the binary data as a stream
      const response = await axios.get(imageurl, {
        responseType: 'stream', // Ensure the response is a readable stream
      });

      // Accumulate the data chunks into a Buffer
      const chunks: Buffer[] = [];

      // Return a promise that resolves when the stream ends
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => chunks.push(chunk)); // Collect chunks
        response.data.on('end', () => resolve(Buffer.concat(chunks))); // Combine chunks
        response.data.on('error', (err: any) => reject(err)); // Handle errors
        });
      } catch (error) {
        console.error('Error fetching binary data:', error);
      throw error;
    }
  } 
});


export default router;