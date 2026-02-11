
import { GoogleGenAI, Type } from "@google/genai";
import { RequestCategory } from '../types';

// Initializing the GoogleGenAI instance directly with the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeServiceRequest = async (description: string, imageBase64?: string) => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  // Using gemini-3-flash-preview as recommended for basic text tasks like summarization and classification.
  const modelId = "gemini-3-flash-preview"; 

  const prompt = `
    Analyze the following campus service request description. 
    Identify the most appropriate Category (Facilities, Sanitation, Academic Docs, Other).
    Also provide a very brief, technical 1-sentence summary of the issue.
  `;

  // Defined the response schema following the Type enumeration and structure for JSON output.
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: { 
        type: Type.STRING, 
        enum: Object.values(RequestCategory),
        description: 'The classified category of the service request'
      },
      summary: { 
        type: Type.STRING,
        description: 'A brief technical summary of the request'
      }
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
        responseSchema: responseSchema
      }
    });

    // Extracting generated text using the .text property from the response object.
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
