// Define types for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define types for API options
export interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  model?: string;
}

// Initialize DeepSeek API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';

// Default model to use
const DEFAULT_MODEL = 'deepseek-chat';

/**
 * Get chat completion from DeepSeek API
 * @param messages Array of chat messages
 * @param options Options for the API call
 * @returns Promise with the API response
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
) {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured. Please set NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment variables.');
    }
    
    // Track the start time for performance monitoring
    const startTime = performance.now();
    
    // Make the API call using fetch
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: options.model || DEFAULT_MODEL,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        top_p: options.top_p ?? 1,
        frequency_penalty: options.frequency_penalty ?? 0,
        presence_penalty: options.presence_penalty ?? 0,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Track the end time and calculate duration
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log the performance metrics
    console.log(`DeepSeek API call completed in ${duration.toFixed(2)}ms`);
    
    // Track the API call in our analytics system
    trackApiCall({
      type: 'deepseek',
      model: options.model || DEFAULT_MODEL,
      duration,
      tokens: data.usage?.total_tokens || 0,
      success: true
    });
    
    return data;
  } catch (error) {
    // Log the error
    console.error('Error calling DeepSeek API:', error);
    
    // Track the failed API call
    trackApiCall({
      type: 'deepseek',
      model: options.model || DEFAULT_MODEL,
      duration: 0,
      tokens: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Interface for API call tracking
interface ApiCallTrackingData {
  type: string;
  model: string;
  duration: number;
  tokens: number;
  success: boolean;
  error?: string;
}

/**
 * Track API calls for analytics and monitoring
 * @param data The tracking data to record
 */
function trackApiCall(data: ApiCallTrackingData) {
  // In a production environment, this would send data to a tracking service
  // For now, we'll just log it to the console
  console.log('API Call Tracked:', data);
  
  // This is where you would implement the actual tracking logic
  // For example, sending to an analytics service or backend API
  // sendToAnalyticsService(data);
}