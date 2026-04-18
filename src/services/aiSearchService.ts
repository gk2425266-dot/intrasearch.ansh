import { ai } from '../lib/gemini';
import { Type } from "@google/genai";
import { Document, AIOverview } from '../types';

export interface AISearchResponse {
  overview: AIOverview;
  webResults: Document[];
  videoResults: Document[];
}

export async function performAISearch(query: string): Promise<AISearchResponse> {
  if (!query) throw new Error("Query is required");

  const prompt = `
    You are a high-performance neural search engine. 
    Analyze the query: "${query}"
    
    1. Provide a concise "AI Overview" summary with key points and suggested follow-up questions.
    2. Generate 5 realistic "Web" search results that would appear on a high-quality global search engine.
    3. Generate 3 realistic "Video" search results (e.g. YouTube style) related to the query.
    
    For web results, include title, description, and a realistic URL.
    For video results, include title, description, a realistic YouTube-style URL (e.g. https://www.youtube.com/watch?v=...), a thumbnail URL (use high quality placeholders like picsum or specific video thumbnails if known), and a videoUrl for embedding.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["summary", "keyPoints", "suggestedQuestions"]
            },
            webResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  url: { type: Type.STRING },
                  updatedAt: { type: Type.STRING }
                },
                required: ["title", "description", "url", "updatedAt"]
              }
            },
            videoResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  url: { type: Type.STRING },
                  thumbnail: { type: Type.STRING },
                  videoUrl: { type: Type.STRING },
                  updatedAt: { type: Type.STRING }
                },
                required: ["title", "description", "url", "thumbnail", "videoUrl", "updatedAt"]
              }
            }
          },
          required: ["overview", "webResults", "videoResults"]
        }
      }
    });

    const data = JSON.parse(response.text);
    
    // Map to Document type
    const webDocs: Document[] = data.webResults.map((res: any, i: number) => ({
      id: `web-${i}`,
      ...res,
      sourceType: 'web',
      relevanceScore: 0.95 - (i * 0.05)
    }));

    const videoDocs: Document[] = data.videoResults.map((res: any, i: number) => ({
      id: `video-${i}`,
      ...res,
      sourceType: 'video',
      fileType: 'video',
      relevanceScore: 0.9 - (i * 0.05)
    }));

    return {
      overview: data.overview,
      webResults: webDocs,
      videoResults: videoDocs
    };
  } catch (error) {
    console.error("AI Search Error:", error);
    throw error;
  }
}
