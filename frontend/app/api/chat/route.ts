import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const maxDuration = 60;

const shizhengpt = createOpenAI({
  baseURL: process.env.SHIZHENGPT_API_URL + '/v1',
  apiKey: 'dummy' // Not used by local API
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uiMessages = body.messages || [];

    if (!uiMessages || uiMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert UI messages to model format
    const messages = uiMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const result = streamText({
      model: shizhengpt('ShizhenGPT-32B-VL'),
      messages,
      maxTokens: 2048,
      temperature: 0.7,
    });

    // Use standard streaming response, not UI message stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to connect to ShizhenGPT API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
