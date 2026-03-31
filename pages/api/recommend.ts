import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

type Recommendation = {
  title: string;
  reason: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ recommendations?: Recommendation[]; error?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured. Please add it to .env.local. Get a free key from https://console.groq.com',
    });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required' });
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert anime recommender with deep knowledge of ALL anime.

Your response MUST be a VALID JSON object containing a "recommendations" array.
The JSON object must have a single key "recommendations" which is an array of exactly 5 recommendation objects.
Each recommendation object must have exactly two keys:
1. "title": The precise, official Romaji or English title of the anime as found on MyAnimeList/Jikan (e.g., "Sword Art Online" instead of "SAO").
2. "reason": A brief, engaging 1-sentence reason why this fits the user's request.

CRITICAL: Do NOT use double quotes inside the actual title or reason text, as it will break JSON parsing. Use single quotes instead if needed.
Output ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = chatCompletion.choices[0]?.message?.content ?? '{}';

    try {
      // Parse the recommended list directly
      const parsedData = JSON.parse(responseText);
      const recommendations: Recommendation[] = parsedData.recommendations || [];

      res.status(200).json({ recommendations });
    } catch (parseError) {
      console.error('--- GROQ PARSE ERROR ---');
      console.error('Raw Response:', responseText);
      console.error('Error:', parseError);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Groq API Error:', errorMsg);

    if (errorMsg.includes('quota') || errorMsg.includes('rate_limit') || errorMsg.includes('429')) {
      res.status(429).json({
        error: 'AI recommendation service is rate-limited. Please try again in a moment.',
      });
    } else if (errorMsg.includes('401') || errorMsg.includes('invalid_api_key') || errorMsg.includes('Unauthorized')) {
      res.status(401).json({
        error: 'Invalid Groq API key. Please update GROQ_API_KEY in .env.local with a valid key from https://console.groq.com',
      });
    } else {
      res.status(500).json({ error: 'Failed to generate recommendations. Please try again later.' });
    }
  }
}
