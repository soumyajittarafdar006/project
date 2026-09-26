import React from 'react';
import { History, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

export default function TempHistoryTable({ history = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Normal
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-3 h-3 mr-1" />
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Temperature Telemetry History</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing last {history.length} records
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[340px] rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Temperature</th>
              <th className="py-3 px-4">Device</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500 italic">
                  No historical records stored in SQLite database yet.
                </td>
              </tr>
            ) : (
              // Display most recent records at the top of table
              [...history].reverse().map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="text-[10px] text-slate-500 ml-2">
                      ({new Date(item.timestamp).toLocaleDateString()})
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white">
                    {item.temperature.toFixed(1)} °C
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-xs">
                    {item.deviceId}
                  </td>
                  <td className="py-2.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
