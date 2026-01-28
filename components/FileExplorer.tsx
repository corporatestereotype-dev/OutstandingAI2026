
import React, { useState, useEffect } from 'react';
import { LivePreview } from './LivePreview';

interface FileEntry {
  name: string;
  type: 'file' | 'dir';
  content: string;
}

export const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([
    { 
      name: 'index.html', 
      type: 'file', 
      content: '<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-900 text-white flex items-center justify-center h-screen">\n  <div id="root" class="text-center animate-bounce">\n    <h1 class="text-4xl font-bold">Hello OutstandingAI!</h1>\n    <p class="text-slate-400 mt-4">Code is running in the sandbox...</p>\n  </div>\n</body>\n</html>' 
    },
    { 
      name: 'app.js', 
      type: 'file', 
      content: 'console.log("App initialized");\n// Try changing text in index.html to see hot reload!' 
    }
  ]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(files[0]);
  const [isEditing, setIsEditing] = useState(true);
  const [editContent, setEditContent] = useState(files[0].content);

  const handleSelect = (file: FileEntry) => {
    setSelectedFile(file);
    setEditContent(file.content);
  };

  const handleSave = () => {
    if (selectedFile) {
      const updatedFiles = files.map(f => f.name === selectedFile.name ? { ...f, content: editContent } : f);
      setFiles(updatedFiles);
      localStorage.setItem('outstanding_sandbox_files', JSON.stringify(updatedFiles));
    }
  };

  // Sync edit buffer to global state for live preview
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSave();
    }, 500); // Debounced "Hot Reload"
    return () => clearTimeout(timeout);
  }, [editContent]);

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Explorer</span>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {files.map(file => (
            <button
              key={file.name}
              onClick={() => handleSelect(file)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedFile?.name === file.name ? 'bg-blue-600 text-white shadow-md scale-[1.02]' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span className="text-sm">{file.type === 'dir' ? '📁' : '📄'}</span>
              <span className="text-xs font-bold truncate">{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="col-span-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-400">/sandbox/{selectedFile?.name}</span>
          <div className="flex gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
        </div>
        <textarea
          className="flex-1 w-full p-6 font-mono text-xs resize-none outline-none bg-transparent text-blue-300 leading-relaxed"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Preview Pane */}
      <div className="col-span-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <LivePreview files={files} />
        {/* Mock Terminal Output */}
        <div className="h-32 bg-slate-900 border-t border-slate-700 p-3 font-mono text-[10px] text-green-400 overflow-y-auto">
          <div className="flex gap-2 mb-1">
            <span className="text-slate-500 font-bold uppercase tracking-widest">Terminal</span>
            <span className="text-slate-700">|</span>
            <span className="text-blue-500">outstanding-ai-v1.0.4</span>
          </div>
          <p>> npm start</p>
          <p className="text-slate-500">Compiling assets...</p>
          <p className="text-green-500">✔ Successfully compiled in 42ms</p>
          <p className="text-slate-400">Ready at http://localhost:5173/</p>
        </div>
      </div>
    </div>
  );
};
