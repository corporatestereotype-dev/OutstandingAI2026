
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ollama, OllamaMessage } from '../services/ollama';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

type Provider = 'gemini' | 'ollama';

export const LLMChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('gemini');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storageKey = `outstanding_chat_${provider}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ 
        role: 'assistant', 
        text: "OutstandingAI Studio is ready. Ask me to generate a React component or a style, and I'll automatically update your preview.",
        timestamp: Date.now()
      }]);
    }

    const checkOllama = async () => {
      const isOnline = await ollama.healthCheck();
      setOllamaStatus(isOnline ? 'online' : 'offline');
      if (isOnline) {
        const models = await ollama.getModels();
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModel)) setSelectedModel(models[0]);
      }
    };
    checkOllama();
  }, [provider]);

  useEffect(() => {
    localStorage.setItem(`outstanding_chat_${provider}`, JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, provider]);

  // Helper to extract code and update "Virtual Sandbox"
  const extractCodeToSandbox = (text: string) => {
    const htmlRegex = /```html([\s\S]*?)```/g;
    const match = htmlRegex.exec(text);
    if (match && match[1]) {
      const existingFiles = JSON.parse(localStorage.getItem('outstanding_sandbox_files') || '[]');
      const updated = existingFiles.map((f: any) => f.name === 'index.html' ? { ...f, content: match[1].trim() } : f);
      localStorage.setItem('outstanding_sandbox_files', JSON.stringify(updated));
      // Notify components by firing a custom event or using a real state manager
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    const newMessage: Message = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      let aiResponseText = "";
      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: userText,
          config: { 
            systemInstruction: "You are an integrated AI studio assistant. When asked to generate code, always wrap it in markdown code blocks. Specifically, if asked to update the UI, provide an ```html block that represents index.html." 
          }
        });
        aiResponseText = response.text || "Empty response.";
      } else {
        const history: OllamaMessage[] = messages.concat(newMessage).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text
        }));
        aiResponseText = await ollama.chat(history, selectedModel);
      }

      extractCodeToSandbox(aiResponseText);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponseText, timestamp: Date.now() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button onClick={() => setProvider('gemini')} className={`px-3 py-1 rounded text-[10px] font-bold ${provider === 'gemini' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>GEMINI</button>
            <button onClick={() => setProvider('ollama')} className={`px-3 py-1 rounded text-[10px] font-bold ${provider === 'ollama' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>OLLAMA</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Run Enabled</span>
           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_green]"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[90%] text-sm shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-[.2em]">Studio processing changes...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
            placeholder="Type 'Create a dark theme login page'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 active:scale-95 transition-all">Send</button>
        </div>
      </div>
    </div>
  );
};
