import { ChatResponse } from "@/types/chat";
import { ragService } from "./axios";

export async function classifyProduct(query: string, topK: number = 5): Promise<ChatResponse> {
  try {
    const response = await ragService.post('', {
      query,
      topK
    });

    return response.data;
  } catch (error: any) {
    // Handle axios error response
    if (error.response) {
      throw new Error(`HTTP error! status: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Network error - no response received');
    } else {
      throw new Error('Error setting up the request');
    }
  }
}