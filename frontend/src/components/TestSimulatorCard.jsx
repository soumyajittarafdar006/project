import React, { useState } from 'react';
import { Send, Zap, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
import { apiService } from '../services/api';

export default function TestSimulatorCard({ onTestDataSent }) {
  const [customTemp, setCustomTemp] = useState('28.5');
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const sendTestPayload = async (tempValue) => {
    setSending(true);
    setStatusMsg('');
    try {
      const result = await apiService.postTestReading('ESP32-01', tempValue);
      setStatusMsg(`Sent ${tempValue}°C successfully!`);
      if (onTestDataSent) onTestDataSent(result);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSending(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Interactive ESP32 Test Simulator</h2>
        </div>
        <span className="text-[11px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-full font-mono">
          Manual Telemetry Trigger
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Send test POST requests to <code className="text-cyan-300 font-mono">/api/sensor/data</code> to instantly verify real-time WebSocket chart and alert updates without physical ESP32 hardware!
      </p>

      {/* Preset Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        
        {/* Preset 1: Normal */}
        <button
          onClick={() => sendTestPayload(28.5)}
          disabled={sending}
          className="flex items-center justify-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl transition-all font-semibold text-xs disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Send Normal (28.5 °C)</span>
        </button>

        {/* Preset 2: Warning */}
        <button
          onClick={() => sendTestPayload(37.0)}
          disabled={sending}
          className="flex items-center justify-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl transition-all font-semibold text-xs disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Send Warning (37.0 °C)</span>
        </button>

        {/* Preset 3: Critical */}
        <button
          onClick={() => sendTestPayload(43.5)}
          disabled={sending}
          className="flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 p-2.5 rounded-xl transition-all font-semibold text-xs disabled:opacity-50"
        >
          <Flame className="w-4 h-4" />
          <span>Send Critical (43.5 °C)</span>
        </button>
      </div>

      {/* Custom Input */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <input
            type="number"
            step="0.1"
            value={customTemp}
            onChange={(e) => setCustomTemp(e.target.value)}
            placeholder="Custom temperature..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">°C</span>
        </div>

        <button
          onClick={() => sendTestPayload(parseFloat(customTemp))}
          disabled={sending || !customTemp}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'Sending...' : 'Send Custom POST'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mt-2 text-xs font-mono text-cyan-400 animate-pulse">
          {statusMsg}
        </div>
      )}
    </div>
  );
}
