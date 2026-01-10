import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

// Declare process for TypeScript to satisfy the build requirement while adhering to SDK usage rules.
declare var process: {
  env: {
    API_KEY: string;
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeImage(base64Image: string, expectedLabel: string): Promise<AIAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `You are simulating a computer vision object detection model. 
            Identify the primary object in this image.
            The image might be heavily distorted (noise, blur, rotation, etc.). 
            - If it's clear, high confidence.
            - If it's blurry/noisy, confidence drops.
            - If it's very messy, you might guess incorrectly or be confused.
            
            Compare your guess to the expected label: "${expectedLabel}".

            Also, pinpoint 1-3 specific areas (rectangular regions) that are particularly confusing or distorted, preventing a 100% clear identification. Use coordinates in percentage (0-100) of the image dimensions.
            
            Provide your response in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "What the AI thinks it sees." },
            confidence: { type: Type.NUMBER, description: "Confidence score 0 to 100." },
            reasoning: { type: Type.STRING, description: "Short explanation for kids about why it was hard or easy." },
            isCorrect: { type: Type.BOOLEAN, description: "Whether the AI guess matches the target object." },
            confusingRegions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "Left coordinate in % (0-100)" },
                  y: { type: Type.NUMBER, description: "Top coordinate in % (0-100)" },
                  width: { type: Type.NUMBER, description: "Width in % (0-100)" },
                  height: { type: Type.NUMBER, description: "Height in % (0-100)" },
                  reason: { type: Type.STRING, description: "Briefly why this specific spot is confusing." }
                },
                required: ["x", "y", "width", "height", "reason"]
              }
            }
          },
          required: ["label", "confidence", "reasoning", "isCorrect"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      label: "Error",
      confidence: 0,
      reasoning: "The AI is too confused to respond!",
      isCorrect: false,
    };
  }
}