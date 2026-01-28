
import React, { useEffect, useRef } from 'react';

export const ArchitectureDiagram: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (chartRef.current && (window as any).mermaid) {
        chartRef.current.innerHTML = `
          <div class="mermaid">
            graph TD
              subgraph Frontend [React Client - Port 3000]
                A[UI Components] --> B[FileSystemContext]
                B --> C[API Hooks]
                C --> D[LLM Hook]
              end

              subgraph Backend [Node/Express - Port 4000]
                E[Express Server] --> F[FileOps Router]
                E --> G[Config Endpoint]
                F --> H[File Access Layer]
                H --> I[Sandbox Middleware]
                E --> P[Ollama Proxy]
              end

              subgraph Infrastructure
                J[Ollama Server - Port 11434]
                K[Linux Host / Sandbox Folder]
              end

              D -- Proxy Request --- P
              P -- Localhost --- J
              C -- REST --- F
              I -- FS Sync --- K
          </div>
        `;
        await (window as any).mermaid.run();
      }
    };
    renderDiagram();
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">System Architecture</h2>
      <div className="overflow-x-auto py-4 bg-slate-50 rounded-lg" ref={chartRef}></div>
      <div className="grid md:grid-cols-2 gap-8 text-slate-600 mt-8">
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800">CORS Mitigation</h3>
          <p>By routing Ollama requests through the Node.js backend (Ollama Proxy), we avoid Cross-Origin Resource Sharing (CORS) errors that typically occur when a browser tries to talk to a local port directly.</p>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800">Sandbox Middleware</h3>
          <p>The Express server acts as a gatekeeper for the Linux host, ensuring the AI can only read/write files within the designated /sandbox directory.</p>
        </div>
      </div>
    </div>
  );
};
