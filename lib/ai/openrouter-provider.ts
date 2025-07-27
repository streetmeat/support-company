import { createOpenAI } from '@ai-sdk/openai';

// Create OpenRouter provider using OpenAI SDK with custom base URL
export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Define the chat model with specific settings from PRD
export const supportChatModel = openrouter('openai/gpt-4o-mini');

// Export model IDs for reference
export const MODEL_IDS = {
  chat: 'openai/gpt-4o-mini',
} as const;