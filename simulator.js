/**
 * ESP32 Temperature Sensor Simulator Script
 * Run: node simulator.js
 * 
 * Simulates an ESP32 sending temperature readings to the Backend API.
 * Helps test the real-time WebSocket dashboard without physical ESP32 hardware!
 */

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/sensor/data';
const DEVICE_ID = 'ESP32-01';
const INTERVAL_MS = 3000; // 3 seconds

let baseTemp = 26.5; // Start in normal range
let step = 0;

console.log('====================================================');
console.log('🚀 ESP32 Temperature Sensor Simulator Started');
console.log(`📡 Sending readings to: ${API_URL}`);
console.log(`⏱️ Interval: Every ${INTERVAL_MS / 1000} seconds`);
console.log('====================================================\n');

function sendReading(temperature) {
  const data = JSON.stringify({
    deviceId: DEVICE_ID,
    temperature: parseFloat(temperature.toFixed(1))
  });

  const urlObj = new URL(API_URL);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 80,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        const alertTag = json.alert ? ` ⚠️ [${json.alert.type.toUpperCase()}]` : ' ✅ [NORMAL]';
        console.log(`[${new Date().toLocaleTimeString()}] Sent ${temperature.toFixed(1)}°C -> Server HTTP ${res.statusCode}${alertTag}`);
      } catch (e) {
        console.log(`[${new Date().toLocaleTimeString()}] Sent ${temperature.toFixed(1)}°C -> Server HTTP ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error sending data: ${error.message} (Is backend running?)`);
  });

  req.write(data);
  req.end();
}

// Generate realistic temperature wave with periodic warning/critical spikes to test alerts
function generateTemperature() {
  step++;
  // Every 15 steps (approx 45 seconds), simulate a temp spike to test warning/critical thresholds
  if (step % 20 >= 12 && step % 20 <= 15) {
    // Warning spike: 36.5°C to 39.0°C
    return 36.0 + Math.random() * 3.5;
  } else if (step % 20 === 16) {
    // Critical spike: 42.5°C
    return 42.5;
  }

  // Normal smooth temperature drift between 24.0°C and 32.0°C
  const sineOffset = Math.sin(step * 0.2) * 3.0;
  const noise = (Math.random() - 0.5) * 0.8;
  return baseTemp + sineOffset + noise;
}

// Initial send immediately
sendReading(27.5);

// Continuous loop
setInterval(() => {
  const temp = generateTemperature();
  sendReading(temp);
}, INTERVAL_MS);
