
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', files: 12 },
  { name: 'Tue', files: 19 },
  { name: 'Wed', files: 32 },
  { name: 'Thu', files: 25 },
  { name: 'Fri', files: 40 },
  { name: 'Sat', files: 15 },
  { name: 'Sun', files: 8 },
];

interface DashboardProps {
  ollamaOnline?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ ollamaOnline }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Sandbox Files', value: '142', sub: '+12 today', color: 'text-blue-600' },
          { label: 'AI Generations', value: '48', sub: '98% success', color: 'text-green-600' },
          { 
            label: 'Ollama Instance', 
            value: ollamaOnline ? 'Online' : 'Offline', 
            sub: ollamaOnline ? 'Port 11434 reachable' : 'Start with "ollama serve"', 
            color: ollamaOnline ? 'text-green-600' : 'text-red-500' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.label}</h3>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">File Operations Activity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="files" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent System Logs</h3>
          <button className="text-xs text-blue-600 font-medium">Clear Logs</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
              <th className="px-6 py-3 font-semibold">Event</th>
              <th className="px-6 py-3 font-semibold">Target</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            <tr>
              <td className="px-6 py-4 text-slate-700">Ollama Heartbeat</td>
              <td className="px-6 py-4 font-mono text-xs">localhost:11434</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs ${ollamaOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {ollamaOnline ? 'Success' : 'Failed'}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400 text-xs">Now</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-slate-700">File Write</td>
              <td className="px-6 py-4 font-mono text-xs">/services/api.js</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Success</span></td>
              <td className="px-6 py-4 text-slate-400 text-xs">2 mins ago</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-slate-700">Security Check</td>
              <td className="px-6 py-4 font-mono text-xs">../../etc/passwd</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Blocked</span></td>
              <td className="px-6 py-4 text-slate-400 text-xs">15 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
