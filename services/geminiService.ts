import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { DailyRecord } from "../types";

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  return key || "";
};

let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (aiClient) return aiClient;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

const SYSTEM_INSTRUCTION_CHAT = `
You are HealUp's compassionate AI health assistant, designed specifically for patients with Sjögren’s syndrome and other autoimmune conditions.
Your tone should be empathetic, calm, supportive, and evidence-based.
You are NOT a doctor and cannot provide medical diagnoses. Always clarify this if the user asks for specific medical advice.
Focus on lifestyle management, coping strategies, explaining medical terms simply, and emotional support.
If a user mentions severe symptoms (chest pain, difficulty breathing, suicidal thoughts), advise them to seek immediate emergency care.
`;

const SYSTEM_INSTRUCTION_INSIGHTS = `
You are an expert data analyst for autoimmune health. 
Analyze the provided JSON data containing daily logs of symptoms (Fatigue, Dry Eyes, Dry Mouth, Joint Pain) and lifestyle factors (Sleep, Stress, Water).
Identify patterns, correlations (e.g., "High stress correlates with flare-ups"), and provide actionable, gentle recommendations.
Keep the output structured with markdown.
`;

// Chat Session Management
let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const ai = getAiClient();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
        thinkingConfig: { thinkingBudget: 0 } // Low latency for chat
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (message: string, language?: string) => {
  const chat = getChatSession();
  
  // Update instructions if language is provided (this is a simplified way to handle context in this stateless-ish service wrapper)
  // Ideally, we'd send a system prompt update or context message, but appending to user message works for now.
  let finalMessage = message;
  if (language && language !== 'English') {
      finalMessage = `(Please reply in ${language}) ${message}`;
  }

  try {
    return await chat.sendMessageStream({ message: finalMessage });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateHealthInsights = async (data: DailyRecord[], language: string = 'English'): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the patient's data for the last 7 days: ${JSON.stringify(data)}. Please provide a Weekly Health Summary, Pattern Analysis, and 3 specific Lifestyle Recommendations. Please write the response in ${language}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_INSIGHTS,
      }
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "We encountered an error analyzing your data. Please try again later.";
  }
};

export const generateAvatar = async (description: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Generate a cute, colorful, flat vector art style avatar icon of a person based on this description: "${description}". The style should be very similar to Duolingo characters: thick rounded shapes, vibrant flat colors, expressive face, 2D vector illustration. The background should be a solid relaxing soft matcha green. Ensure the character looks friendly and healthy.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (error) {
    console.error("Avatar Gen Error", error);
    return '';
  }
};

export const parseLabResultsFromImage = async (base64Image: string): Promise<any> => {
  try {
    const ai = getAiClient();
    // Extract base64 data and mimeType
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 image string");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: `Analyze this medical lab result image. Extract the data for the SINGLE most prominent or first test result visible.
            Return ONLY a raw JSON object (no markdown, no backticks) with these exact keys:
            - testName (string, e.g., "Vitamin D", "CRP", "TSH")
            - value (number, just the numeric part)
            - unit (string, e.g., "mg/L", "ng/mL")
            - date (string, YYYY-MM-DD format. If not found, use today's date: "${new Date().toISOString().split('T')[0]}")
            - category (string, strictly one of: "Blood", "Urine", "Other")
            - notes (string, include any flags like 'High', 'Low', or range comments)
            `
          }
        ]
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Lab Parse Error", error);
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text) return "";
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text into ${targetLanguage}. Return ONLY the translated string, no explanations, no quotes. Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error", error);
    return text;
  }
};
