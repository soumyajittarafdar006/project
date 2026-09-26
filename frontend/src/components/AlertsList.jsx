import React from 'react';
import { Bell, AlertTriangle, Flame, Info } from 'lucide-react';

export default function AlertsList({ alerts = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">System Alert History</h2>
        </div>
        <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full font-mono">
          {alerts.length} Total Alerts
        </span>
      </div>

      <div className="overflow-y-auto max-h-[300px] space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
            <Info className="w-6 h-6 mb-1 text-slate-600" />
            <p>No threshold violations recorded.</p>
            <p className="text-[10px] text-slate-600">All temperatures are within safe operating range.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition-all text-xs flex items-start space-x-3 ${
                alert.type === 'Critical'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-900/60 mt-0.5">
                {alert.type === 'Critical' ? (
                  <Flame className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>{alert.deviceId} ({alert.temperature.toFixed(1)}°C)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 opacity-90">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
