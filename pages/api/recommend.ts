import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

  if (!genAI) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment variables.' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the actual prompt for Gemini to get structured output
    const systemInstruction = `
You are an expert anime recommender with deep knowledge of ALL anime, including obscure titles, genres like isekai, romance, shounen, mecha, slice of life, etc.
The user is looking for anime recommendations. Their prompt: "${prompt}"

Your response MUST be a VALID JSON array of exactly 5 recommendation objects.
Each object must have exactly two keys:
1. "title": The precise, official Romaji or English title of the anime as found on MyAnimeList/Jikan (e.g., "Sword Art Online" instead of "SAO").
2. "reason": A brief, engaging 1-sentence reason why this fits the user's request.

Do NOT include any markdown formatting like \`\`\`json. Return ONLY the raw JSON array string.
`;

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();

    // Remove any potential markdown block markers from the response
    const cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse the recommended list
    const recommendations: Recommendation[] = JSON.parse(cleanJSON);

    // Give it back to the client
    res.status(200).json({ recommendations });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations. Please try again later.' });
  }
}
