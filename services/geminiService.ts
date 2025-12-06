
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RequestCategory } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeServiceRequest = async (description: string, imageBase64?: string) => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    Analyze the following campus service request description. 
    Identify the most appropriate Category (Facilities, Sanitation, Academic Docs, Other).
    Also provide a very brief, technical 1-sentence summary of the issue.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, enum: Object.values(RequestCategory) },
      summary: { type: Type.STRING }
    },
    required: ["category", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: prompt }, { text: `Description: "${description}"` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return {
      category: data.category as RequestCategory,
      summary: data.summary
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};
