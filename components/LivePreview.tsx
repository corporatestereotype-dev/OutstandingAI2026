
import React, { useEffect, useState, useRef } from 'react';

interface LivePreviewProps {
  files: { name: string; content: string }[];
}

export const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Generate the preview document
    const indexHtml = files.find(f => f.name === 'index.html')?.content || '<html><body><div id="root"></div></body></html>';
    const styles = files.filter(f => f.name.endsWith('.css')).map(f => `<style>${f.content}</style>`).join('\n');
    const scripts = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts')).map(f => `<script type="module">${f.content}</script>`).join('\n');

    // Simple Hot Reloading Logic: Injecting styles and scripts into the index.html template
    const fullDoc = indexHtml
      .replace('</head>', `${styles}</head>`)
      .replace('</body>', `${scripts}</body>`);

    setSrcDoc(fullDoc);
  }, [files]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="bg-slate-100 px-4 py-2 border-b flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview (Vite-Sim)</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      {error && (
        <div className="absolute top-10 left-0 right-0 bg-red-500 text-white p-2 text-xs font-mono z-20">
          {error}
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="preview"
        className="w-full h-full border-none bg-white"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-modals"
      />
    </div>
  );
};
