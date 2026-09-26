import React from 'react';
import { Thermometer, ArrowDownRight, ArrowUpRight, Calculator, Database, Cpu } from 'lucide-react';

export default function StatsCards({ stats, isDeviceOnline }) {
  const cards = [
    {
      title: 'Current Temp',
      value: stats?.current !== undefined ? `${stats.current.toFixed(1)} °C` : '--.- °C',
      sub: 'Latest reading',
      icon: <Thermometer className="w-5 h-5 text-cyan-400" />,
      bgColor: 'border-cyan-500/20'
    },
    {
      title: 'Minimum Temp',
      value: stats?.minimum !== undefined ? `${stats.minimum.toFixed(1)} °C` : '--.- °C',
      sub: 'Lowest recorded',
      icon: <ArrowDownRight className="w-5 h-5 text-emerald-400" />,
      bgColor: 'border-emerald-500/20'
    },
    {
      title: 'Maximum Temp',
      value: stats?.maximum !== undefined ? `${stats.maximum.toFixed(1)} °C` : '--.- °C',
      sub: 'Peak recorded',
      icon: <ArrowUpRight className="w-5 h-5 text-amber-400" />,
      bgColor: 'border-amber-500/20'
    },
    {
      title: 'Average Temp',
      value: stats?.average !== undefined ? `${stats.average.toFixed(1)} °C` : '--.- °C',
      sub: 'Mean over session',
      icon: <Calculator className="w-5 h-5 text-indigo-400" />,
      bgColor: 'border-indigo-500/20'
    },
    {
      title: 'Total Readings',
      value: stats?.totalReadings || 0,
      sub: 'Stored in SQLite DB',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      bgColor: 'border-purple-500/20'
    },
    {
      title: 'Device Status',
      value: isDeviceOnline ? 'ONLINE' : 'OFFLINE',
      sub: 'ESP32 Wi-Fi Node',
      icon: <Cpu className={`w-5 h-5 ${isDeviceOnline ? 'text-emerald-400' : 'text-slate-500'}`} />,
      bgColor: isDeviceOnline ? 'border-emerald-500/30' : 'border-slate-800',
      valueColor: isDeviceOnline ? 'text-emerald-400' : 'text-slate-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-slate-900 border ${c.bgColor} rounded-xl p-4 shadow-lg hover:border-slate-700 transition-all`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 truncate">{c.title}</span>
            <div className="p-1.5 bg-slate-800 rounded-lg">{c.icon}</div>
          </div>
          <div className={`text-2xl font-bold font-mono ${c.valueColor || 'text-white'}`}>
            {c.value}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
