export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare form data for backend
    const backendForm = new FormData();
    backendForm.append('image', image);
    backendForm.append('query', '请从中医角度解读这张舌苔。分析舌色、苔色、舌形、润燥等特征，并给出对应的中医证型和调理建议。');

    // Call ShizhenGPT vision API
    const response = await fetch(`${process.env.SHIZHENGPT_API_URL}/v1/vision/analyze`, {
      method: 'POST',
      body: backendForm
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ShizhenGPT vision API error:', error);
      return new Response(
        JSON.stringify({ error: 'Vision API call failed', details: error }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const diagnosis = data.analysis || data.response || data.text || '';

    return new Response(
      JSON.stringify({
        diagnosis,
        success: true
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Vision API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze tongue image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
