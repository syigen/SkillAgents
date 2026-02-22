import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_MODEL } from "./models";

/**
 * Creates a Gemini model instance using the provided user API key and model name.
 */
export function getModel(apiKey: string, modelName: string = DEFAULT_MODEL) {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}
