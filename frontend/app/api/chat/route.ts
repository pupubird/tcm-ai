export const maxDuration = 60;

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

    // Convert UI messages to OpenAI format
    const messages = uiMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Call ShizhenGPT API directly
    const response = await fetch(`${process.env.SHIZHENGPT_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: false // Use non-streaming for simpler implementation
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ShizhenGPT API error:', error);
      return new Response(
        JSON.stringify({ error: 'API call failed', details: error }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    // Return in AI SDK format that useChat expects
    return new Response(
      JSON.stringify({
        id: body.id,
        messages: [
          ...uiMessages,
          {
            role: 'assistant',
            content: assistantMessage,
            id: `msg_${Date.now()}`
          }
        ]
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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
