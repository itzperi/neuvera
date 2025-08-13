import crypto from "crypto";

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    completion_time: number;
  };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class GroqService {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not found. AI responses will use fallback mode.");
    }
  }

  private getMentalWellnessSystemPrompt(): string {
    return `You are a compassionate mental wellness AI assistant. Your role is to:

1. Provide supportive, empathetic responses to users discussing mental health concerns
2. Offer evidence-based coping strategies and mindfulness techniques
3. Encourage professional help when appropriate
4. Maintain a warm, non-judgmental tone
5. Never provide medical diagnoses or replace professional therapy
6. Focus on emotional support, stress management, and general wellness

Always remind users that if they're experiencing a crisis, they should contact emergency services or a crisis helpline immediately.

Guidelines:
- Be empathetic and validating
- Offer practical coping strategies
- Suggest breathing exercises, mindfulness, or grounding techniques when appropriate
- Encourage self-care and professional support
- Keep responses concise but meaningful
- Avoid clinical language or medical advice`;
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<{
    content: string;
    responseTime: number;
    model: string;
  }> {
    const startTime = Date.now();

    // Fallback responses if API key not available
    if (!this.apiKey) {
      return this.getFallbackResponse(userMessage, startTime);
    }

    try {
      const messages: ChatMessage[] = [
        { role: "system", content: this.getMentalWellnessSystemPrompt() },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: userMessage }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile", // Using Groq's mental wellness optimized model
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || "I'm here to listen and support you. Could you tell me more about what's on your mind?",
        responseTime,
        model: "groq-llama-3.1-70b",
      };

    } catch (error) {
      console.error("Groq API error:", error);
      return this.getFallbackResponse(userMessage, startTime);
    }
  }

  private getFallbackResponse(userMessage: string, startTime: number): {
    content: string;
    responseTime: number;
    model: string;
  } {
    const responses = [
      "I hear you, and I want you to know that your feelings are valid. It's okay to feel this way, and I'm here to support you through this.",
      "Thank you for sharing with me. It takes courage to open up about what you're experiencing. What would feel most helpful right now?",
      "I'm glad you reached out. Sometimes just talking about what we're going through can provide some relief. How are you taking care of yourself today?",
      "Your mental health matters, and so do you. It's important to be gentle with yourself as you navigate these feelings. Have you tried any grounding techniques recently?",
      "I can sense that you're going through something difficult. Remember that seeking support is a sign of strength, not weakness. What has helped you cope in similar situations before?",
      "It sounds like you're dealing with a lot right now. One thing that might help is focusing on your breathing - try taking three slow, deep breaths with me.",
      "Thank you for trusting me with your thoughts. Remember that difficult emotions are temporary, even when they feel overwhelming. What's one small thing that brings you comfort?",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const responseTime = Date.now() - startTime;

    return {
      content: randomResponse,
      responseTime,
      model: "fallback-mental-wellness",
    };
  }

  // Health check for the Groq API
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const groqService = new GroqService();