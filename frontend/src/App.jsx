import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MainTempCard from './components/MainTempCard';
import LiveChart from './components/LiveChart';
import StatsCards from './components/StatsCards';
import TempHistoryTable from './components/TempHistoryTable';
import ThresholdSettings from './components/ThresholdSettings';
import AlertsList from './components/AlertsList';
import TestSimulatorCard from './components/TestSimulatorCard';
import { apiService } from './services/api';
import { initSocket, disconnectSocket } from './services/socket';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({ minTemp: 20, maxTemp: 35, criticalTemp: 40 });
  const [alerts, setAlerts] = useState([]);
  const [backendError, setBackendError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial telemetry data from backend
  const loadDashboardData = useCallback(async () => {
    setBackendError(null);
    try {
      const [latestRes, historyRes, statsRes, statusRes, settingsRes, alertsRes] = await Promise.all([
        apiService.getLatest().catch(() => ({ data: null })),
        apiService.getHistory(50).catch(() => ({ data: [] })),
        apiService.getStats().catch(() => ({ stats: null })),
        apiService.getStatus().catch(() => ({ online: false })),
        apiService.getSettings().catch(() => ({ settings: { minTemp: 20, maxTemp: 35, criticalTemp: 40 } })),
        apiService.getAlerts(20).catch(() => ({ data: [] }))
      ]);

      if (latestRes?.data) setLatestReading(latestRes.data);
      if (historyRes?.data) setHistory(historyRes.data);
      if (statsRes?.stats) setStats(statsRes.stats);
      if (statusRes?.online !== undefined) setIsDeviceOnline(statusRes.online);
      if (settingsRes?.settings) setSettings(settingsRes.settings);
      if (alertsRes?.data) setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setBackendError(`Cannot connect to Backend server at ${apiService.getApiUrl()}. Please verify Node backend is running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stats locally when new reading arrives
  const updateStatsLocally = (newReading) => {
    setStats((prev) => {
      const temp = newReading.temperature;
      if (!prev || prev.totalReadings === 0) {
        return {
          current: temp,
          minimum: temp,
          maximum: temp,
          average: temp,
          totalReadings: 1,
          status: newReading.status
        };
      }
      const total = prev.totalReadings + 1;
      const min = Math.min(prev.minimum, temp);
      const max = Math.max(prev.maximum, temp);
      const avg = (prev.average * prev.totalReadings + temp) / total;
      return {
        current: temp,
        minimum: min,
        maximum: max,
        average: avg,
        totalReadings: total,
        status: newReading.status
      };
    });
  };

  useEffect(() => {
    loadDashboardData();

    // Initialize Socket.IO connection
    const socket = initSocket((status) => {
      setIsWsConnected(status);
      if (status) setBackendError(null);
    });

    // Handle incoming real-time temperature telemetry
    socket.on('temperatureUpdate', (newReading) => {
      console.log('⚡ WebSocket temperatureUpdate received:', newReading);
      setLatestReading(newReading);
      setIsDeviceOnline(true);

      // Append to history (keep max 50 points)
      setHistory((prev) => {
        const updated = [...prev, newReading];
        return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
      });

      // Update statistics
      updateStatsLocally(newReading);
    });

    // Handle new threshold alerts
    socket.on('newAlert', (newAlert) => {
      console.warn('⚠️ WebSocket newAlert received:', newAlert);
      setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
    });

    // Handle live threshold setting updates from server
    socket.on('settingsUpdate', (updatedSettings) => {
      console.log('⚙️ WebSocket settingsUpdate received:', updatedSettings);
      setSettings(updatedSettings);
    });

    // Periodic check for ESP32 online/offline status (every 5 seconds)
    const statusInterval = setInterval(async () => {
      try {
        const statusRes = await apiService.getStatus();
        if (statusRes && statusRes.online !== undefined) {
          setIsDeviceOnline(statusRes.online);
        }
      } catch (e) {
        // Backend offline
      }
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      disconnectSocket();
    };
  }, [loadDashboardData]);

  const handleSaveSettings = async (newSettings) => {
    const res = await apiService.updateSettings(newSettings);
    if (res?.settings) {
      setSettings(res.settings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navbar Header */}
      <Header
        isWsConnected={isWsConnected}
        isDeviceOnline={isDeviceOnline}
        lastUpdated={latestReading?.timestamp}
        onRefresh={loadDashboardData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Backend Offline Error Banner */}
        {backendError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm shadow-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{backendError}</span>
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center space-x-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm">Connecting to ESP32 Telemetry Server...</p>
          </div>
        ) : (
          <>
            {/* Top Stats Overview Row */}
            <StatsCards stats={stats} isDeviceOnline={isDeviceOnline} />

            {/* Main Grid Section: Live Temp Card & Real-Time Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MainTempCard latestReading={latestReading} isDeviceOnline={isDeviceOnline} />
              </div>
              <div className="lg:col-span-2">
                <LiveChart history={history} settings={settings} />
              </div>
            </div>

            {/* Test Simulator Banner */}
            <TestSimulatorCard onTestDataSent={() => loadDashboardData()} />

            {/* Mid Grid Section: History Table & Alerts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TempHistoryTable history={history} />
              <AlertsList alerts={alerts} />
            </div>

            {/* Bottom Section: Threshold Settings */}
            <ThresholdSettings settings={settings} onSaveSettings={handleSaveSettings} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>ESP32 Temperature Monitor • Built with React, Vite, Node.js, Express, Socket.IO & SQLite</p>
      </footer>
    </div>
  );
}
