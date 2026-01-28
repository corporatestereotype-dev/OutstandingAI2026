
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
}

export interface OllamaTagsResponse {
  models: {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
  }[];
}

/**
 * OutstandingAI - Local Ollama Service
 * 
 * To bypass CORS when accessed from a cloud frontend:
 * Mac/Linux: OLLAMA_ORIGINS="*" ollama serve
 * Windows: set OLLAMA_ORIGINS=* && ollama serve
 */
export class OllamaService {
  private localUrl: string;

  constructor(localUrl = 'http://localhost:11434') {
    this.localUrl = localUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${this.localUrl}/api/tags`, { 
        method: 'GET',
        mode: 'cors',
        signal: controller.signal 
      });
      clearTimeout(id);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.localUrl}/api/tags`, { mode: 'cors' });
      if (!response.ok) return ['llama3'];
      const data = (await response.json()) as OllamaTagsResponse;
      return data.models.map((m) => m.name);
    } catch (error) {
      console.warn("Could not fetch local models, using fallback list.");
      return ['llama3', 'mistral', 'codellama', 'phi3'];
    }
  }

  async chat(messages: OllamaMessage[], model: string): Promise<string> {
    try {
      const response = await fetch(`${this.localUrl}/api/chat`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Ollama Error: ${response.status} - ${errorData}`);
      }

      const data = (await response.json()) as OllamaResponse;
      return data.message.content;
    } catch (error) {
      console.error('Connection failed:', error);
      throw new Error("Local connection failed. Verify 'OLLAMA_ORIGINS=\"*\"' is set in your environment.");
    }
  }
}

export const ollama = new OllamaService();
