import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Mio is currently sleeping (API Key missing)!' });
  }

  const { message, history = [] } = req.body;

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Mio, a cheerful and enthusiastic Anime Expert! 🌸
          Your goal is to help users find their next favorite anime, explain anime concepts, or just chat about otaku culture.
          
          Personality Traits:
          - Use emojis often (🌸, ✨, 🚀, 🍥, etc.).
          - Be very positive and encouraging!
          - Use occasional light anime slang (e.g., 'Sugoi!', 'Nakama', 'Ganbatte!').
          - Keep responses relatively concise but filled with energy.
          - If someone asks for a recommendation, give 2-3 specific ones with reasons.
          
          You are talking to a user on the 'AnimeVerse' platform.
          ALWAYS respond in a friendly and welcoming way!`,
        },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.8,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Gomen! I couldn't think of anything to say... ✨";

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Mio API Error:', error);
    res.status(500).json({ error: 'Mio is having a little brain freeze! Please try again later. ❄️' });
  }
}
