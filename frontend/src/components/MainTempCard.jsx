import React from 'react';
import { Thermometer, AlertTriangle, ShieldCheck, Flame, Cpu } from 'lucide-react';

export default function MainTempCard({ latestReading, isDeviceOnline }) {
  const temp = latestReading?.temperature;
  const status = !isDeviceOnline && !latestReading ? 'Offline' : (latestReading?.status || 'Normal');
  const timestamp = latestReading?.timestamp;

  const getStatusBadge = () => {
    switch (status) {
      case 'Normal':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
          icon: <ShieldCheck className="w-5 h-5 mr-1.5" />,
          label: 'Normal'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse',
          glow: 'shadow-amber-500/20 hover:shadow-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 mr-1.5" />,
          label: 'Warning'
        };
      case 'Critical':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse',
          glow: 'shadow-rose-500/20 hover:shadow-rose-500/30',
          icon: <Flame className="w-5 h-5 mr-1.5" />,
          label: 'Critical'
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-400',
          glow: '',
          icon: <Cpu className="w-5 h-5 mr-1.5" />,
          label: 'Offline / No Data'
        };
    }
  };

  const badge = getStatusBadge();

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'No readings yet';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 2) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `Updated ${minutes} minutes ago (${new Date(dateStr).toLocaleTimeString()})`;
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300 ${badge.glow}`}>
      
      {/* Background Ambient Glow */}
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
        status === 'Critical' ? 'bg-rose-500' :
        status === 'Warning' ? 'bg-amber-500' :
        status === 'Normal' ? 'bg-emerald-500' : 'bg-slate-600'
      }`} />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center">
          <Thermometer className="w-4 h-4 mr-2 text-cyan-400" />
          Live Temperature Reading
        </span>

        {/* Status Pill */}
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
          {badge.icon}
          {badge.label}
        </div>
      </div>

      {/* Temperature Display */}
      <div className="my-4 flex items-baseline">
        <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-mono">
          {temp !== undefined && temp !== null ? temp.toFixed(1) : '--.-'}
        </span>
        <span className="text-3xl sm:text-4xl font-semibold text-cyan-400 ml-2">°C</span>
      </div>

      {/* Device & Updated Subtitle */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Device ID: <strong className="text-slate-200 font-mono">{latestReading?.deviceId || 'ESP32-01'}</strong></span>
        </div>
        <span>{formatTimeAgo(timestamp)}</span>
      </div>
    </div>
  );
}
