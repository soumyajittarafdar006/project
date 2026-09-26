import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ThresholdSettings({ settings, onSaveSettings }) {
  const [minTemp, setMinTemp] = useState(20.0);
  const [maxTemp, setMaxTemp] = useState(35.0);
  const [criticalTemp, setCriticalTemp] = useState(40.0);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (settings) {
      setMinTemp(settings.minTemp ?? 20.0);
      setMaxTemp(settings.maxTemp ?? 35.0);
      setCriticalTemp(settings.criticalTemp ?? 40.0);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const min = parseFloat(minTemp);
    const max = parseFloat(maxTemp);
    const crit = parseFloat(criticalTemp);

    if (isNaN(min) || isNaN(max) || isNaN(crit)) {
      setMsg({ type: 'error', text: 'All values must be valid numbers.' });
      return;
    }

    if (min >= max) {
      setMsg({ type: 'error', text: 'Min threshold must be strictly less than Max threshold.' });
      return;
    }

    if (max >= crit) {
      setMsg({ type: 'error', text: 'Max threshold must be strictly less than Critical threshold.' });
      return;
    }

    setSaving(true);
    try {
      await onSaveSettings({ minTemp: min, maxTemp: max, criticalTemp: crit });
      setMsg({ type: 'success', text: 'Threshold settings saved and broadcasted to clients!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save threshold settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Temperature Threshold Settings</h2>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 mb-4 border ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Min Temp */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">
              Minimum Threshold (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={minTemp}
              onChange={(e) => setMinTemp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              required
            />
            <span className="text-[10px] text-slate-500">Below this = Low Temp Warning</span>
          </div>

          {/* Max Temp */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              Maximum Threshold (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={maxTemp}
              onChange={(e) => setMaxTemp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              required
            />
            <span className="text-[10px] text-slate-500">Above this = High Temp Warning</span>
          </div>

          {/* Critical Temp */}
          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1">
              Critical Threshold (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={criticalTemp}
              onChange={(e) => setCriticalTemp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              required
            />
            <span className="text-[10px] text-slate-500">Above this = CRITICAL ALERT</span>
          </div>
        </div>

        {/* Visual Threshold Bar */}
        <div className="pt-2">
          <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between font-mono">
            <span>Normal: {minTemp}°C – {maxTemp}°C</span>
            <span>Warning: {maxTemp}°C – {criticalTemp}°C</span>
            <span>Critical: &gt;{criticalTemp}°C</span>
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 border border-slate-700">
            <div className="bg-emerald-500 h-full" style={{ width: '50%' }} title="Normal Range" />
            <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="Warning Range" />
            <div className="bg-rose-500 h-full" style={{ width: '25%' }} title="Critical Range" />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Thresholds'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
