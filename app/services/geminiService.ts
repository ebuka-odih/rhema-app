import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Converts a Blob to a base64 string suitable for the Gemini API.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const processSermonAudio = async (audioBlob: Blob): Promise<{ transcription: string; summary: string }> => {
  try {
    const ai = getAiClient();
    const base64Audio = await blobToBase64(audioBlob);

    // We use gemini-2.5-flash for speed and efficiency with audio
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are an expert theological assistant. 
      1. Transcribe the provided sermon audio accurately.
      2. Provide a concise summary of the key theological takeaways in bullet points.
      
      Output format strictly JSON:
      {
        "transcription": "Full text here...",
        "summary": "• Point 1\n• Point 2..."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm', // Fallback if type is missing, usually webm/mp4 from browser
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return {
      transcription: result.transcription || "Transcription unavailable.",
      summary: result.summary || "Summary unavailable."
    };

  } catch (error) {
    console.error("Gemini processing error:", error);
    throw error;
  }
};
