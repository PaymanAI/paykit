import { generateText } from 'ai';
import { paykit } from './src/tools';
import { openai } from '@ai-sdk/openai';


const paymanTools = paykit({
  apiSecret: process.env.PAYMAN_API_SECRET!,
  environment: 'sandbox',
});

const result = await generateText({
  model: openai('gpt-4o'),
  tools: paymanTools,
  prompt: 'Send a payment of $50 to Jon',
}); 

console.log(result);