import React from 'react';
import { Thermometer, Wifi, WifiOff, Cpu, RefreshCw } from 'lucide-react';

export default function Header({ isWsConnected, isDeviceOnline, lastUpdated, onRefresh }) {
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'No data';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 2) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(dateStr).toLocaleTimeString();
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Thermometer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ESP32 Temperature Monitor
            </h1>
            <p className="text-xs text-slate-400">IoT Real-Time Telemetry Dashboard</p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* WebSocket Server Connection Status */}
          <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
            isWsConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {isWsConnected ? <Wifi className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 mr-1.5" />}
            <span>{isWsConnected ? 'Server Connected' : 'Server Offline'}</span>
          </div>

          {/* ESP32 Device Status */}
          <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
            isDeviceOnline 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            <span>ESP32: {isDeviceOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-slate-400 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span>Last Updated: </span>
            <span className="font-semibold text-slate-200">{formatTimeAgo(lastUpdated)}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
