import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

export default function LiveChart({ history = [], settings }) {
  // Format history data for chart
  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: parseFloat(item.temperature.toFixed(1)),
    status: item.status,
    rawTime: item.timestamp
  }));

  const minThreshold = settings?.minTemp ?? 20;
  const maxThreshold = settings?.maxTemp ?? 35;
  const criticalThreshold = settings?.criticalTemp ?? 40;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-slate-400 font-mono mb-1">{label}</p>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold text-base">{data.temperature} °C</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              data.status === 'Critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              data.status === 'Warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {data.status}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Live Temperature Trend</h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
            Real-Time ({history.length} points)
          </span>
        </div>

        {/* Threshold Legends */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-slate-400">Min ({minThreshold}°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
            <span className="text-slate-400">Max ({maxThreshold}°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-400 rounded-full" />
            <span className="text-slate-400">Critical ({criticalThreshold}°C)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
          <Activity className="w-8 h-8 mb-2 animate-bounce text-slate-600" />
          <p>Waiting for real-time ESP32 temperature telemetry...</p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />

              {/* Threshold Lines */}
              <ReferenceLine y={minThreshold} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Min: ${minThreshold}°C`, fill: '#10b981', fontSize: 10, position: 'insideBottomLeft' }} />
              <ReferenceLine y={maxThreshold} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Max: ${maxThreshold}°C`, fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine y={criticalThreshold} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `Critical: ${criticalThreshold}°C`, fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
