
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FileExplorer } from './components/FileExplorer';
import { LLMChat } from './components/LLMChat';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { ollama } from './services/ollama';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'files' | 'chat' | 'docs'>('dashboard');
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      const online = await ollama.healthCheck();
      setIsOllamaOnline(online);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard ollamaOnline={isOllamaOnline} />;
      case 'files':
        return <FileExplorer />;
      case 'chat':
        return <LLMChat />;
      case 'docs':
        return <ArchitectureDiagram />;
      default:
        return <Dashboard ollamaOnline={isOllamaOnline} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
              {activeTab}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ollama</span>
                <div className={`w-2 h-2 rounded-full ${isOllamaOnline ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs font-medium text-slate-600">{isOllamaOnline ? 'Local Connected' : 'Local Offline'}</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Gemini API Ready</span>
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
