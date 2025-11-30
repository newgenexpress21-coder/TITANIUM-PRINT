import { GoogleGenAI } from "@google/genai";
import { WorkLog } from "../types";

// Helper to get safe text
const getResponseText = (response: any): string => {
  return response.text || "No analysis generated.";
};

export const analyzeWorkLogs = async (logs: WorkLog[]): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return "API Key missing. Unable to generate AI report. Please set the API_KEY environment variable.";
  }

  if (logs.length === 0) {
    return "No work logs available to analyze.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data for prompt
    const logSummary = logs.slice(0, 20).map(log => 
      `- ${log.employeeName} (${log.date.split('T')[0]}): Job "${log.jobName}" for ${log.customerName}. Status: ${log.progress}%. Details: ${log.workDetails}`
    ).join('\n');

    const prompt = `
      You are an executive assistant for "Lion Smart Enterprises", a printing and manufacturing company.
      Analyze the following recent daily work logs from employees:

      ${logSummary}

      Please provide a concise executive summary covering:
      1. Overall productivity and main achievements today.
      2. Any potential bottlenecks or low-progress items (progress < 100%).
      3. A brief sentiment analysis of the work details.
      4. Recommendations for tomorrow.

      Format the output with Markdown headings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return getResponseText(response);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Failed to generate report due to an API error. Please try again later.";
  }
};