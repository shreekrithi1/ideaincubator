
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMarketingCopy(techSummary: string, techDescription: string) {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("⚠️ OPENAI_API_KEY not set. Returning mock G2M kit.");
        return {
            tagline: "Innovation delivered.",
            value_prop: "This feature adds significant value to your workflow by optimizing core processes.",
            social_post: "We just accepted a new feature! 🚀 Check it out now. #Innovation",
            release_notes: ["Feature imported from JIRA", "Optimized performance", "Bug fixes"]
        };
    }

    const prompt = `
    You are a Senior Product Marketing Manager at an Enterprise SaaS company.
    
    SOURCE MATERIAL (Technical Specs):
    Title: ${techSummary}
    Details: ${techDescription}
    
    TASK:
    Create a Go-to-Market launch kit. Return strictly valid JSON with the following keys:
    1. "tagline": A punchy, 1-sentence hook (max 10 words).
    2. "value_prop": A clear paragraph explaining "Why this matters" to a non-technical CEO.
    3. "social_post": A LinkedIn post (professional but engaging) with emojis.
    4. "release_notes": A bulleted list of features cleaned of developer jargon.
  `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a marketing expert assistant." }, { role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    } catch (e) {
        console.error("AI Generation Failed:", e);
        return null;
    }
}
