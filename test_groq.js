const Groq = require('groq-sdk');


async function main() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

Output ONLY valid JSON.`,
      },
      {
        role: 'user',
        content: "An epic isekai with a touch of romance",
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 1024,
  });

  const responseText = chatCompletion.choices[0]?.message?.content ?? '{}';
  console.log("--- RAW RESPONSE ---");
  console.log(responseText);
  console.log("--- TRYING TO PARSE ---");
  try {
    const parsedData = JSON.parse(responseText);
    console.log("Parse successful!");
    console.log(parsedData);
  } catch(e) {
    console.error("PARSE ERROR:", e.message);
  }
}

main().catch(console.error);
