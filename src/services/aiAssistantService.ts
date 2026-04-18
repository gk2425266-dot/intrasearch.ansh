import { ai } from '../lib/gemini';
import { ChatMessage } from '../types';

export async function getAIAssistantResponse(history: ChatMessage[], message: string, tone: string = 'professional'): Promise<string> {
  try {
    const contents = [
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user' as const,
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: `You are the Lattice Neural Assistant, a helpful and futuristic AI. You assist users with searching the global index, analyzing data, and navigating the search engine. Maintain a ${tone}, tech-forward, and slightly futuristic tone.`
      }
    });

    return response.text || "I apologize, my semantic link was interrupted. Please rephrase your query.";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    throw new Error("I encountered a neural synchronization error. Please try again.");
  }
}
