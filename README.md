# 🌡️ ESP32 Temperature Monitoring Dashboard

A complete, professional full-stack **IoT Temperature Monitoring System** built with **React, Vite, Tailwind CSS, Express.js, Socket.IO, and SQLite**. This system connects directly to an **ESP32 microcontroller** with a temperature sensor (DHT11, DHT22, DS18B20) to record and display live temperature readings in real time without refreshing the page.

---

## 📌 Features

- ⚡ **Real-Time Live Telemetry**: Instant WebSocket broadcasts (`Socket.IO`) whenever new ESP32 temperature data arrives.
- 📈 **Interactive Live Temperature Graph**: Recharts line visualization with dynamic threshold boundary lines.
- 📊 **Aggregated Statistics**: Automatically calculates Current, Min, Max, and Average temperature & total readings stored in SQLite.
- ⚙️ **Configurable Thresholds**: Set Minimum, Maximum, and Critical temperature limits live from the dashboard.
- 🚨 **Automated Alerting**: Automatic warning and critical alert generation stored in database and notified immediately.
- 📜 **Historical Logs**: Detailed tabular telemetry history log.
- 🧪 **Built-in ESP32 Simulator**: Integrated simulation tool (`simulator.js` and in-dashboard quick triggers) to test real-time updates without physical hardware.

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── controllers/
│   │   ├── sensorController.js    # Logic for sensor data ingestion & telemetry
│   │   └── settingsController.js  # Logic for temperature threshold configurations
│   ├── database/
│   │   └── db.js                  # SQLite database initialization & query helpers
│   ├── routes/
│   │   ├── sensor.js              # REST endpoints for sensor API
│   │   └── settings.js            # REST endpoints for settings API
│   ├── services/
│   │   └── socketService.js       # Real-time WebSocket broadcasting service
│   ├── server.js                  # Express & Socket.IO server entrypoint
│   ├── .env                       # Backend configuration file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                # Brand navbar & online connection badges
│   │   │   ├── MainTempCard.jsx          # Primary temperature readout card
│   │   │   ├── LiveChart.jsx             # Real-time trend chart
│   │   │   ├── StatsCards.jsx            # Aggregated statistics metrics grid
│   │   │   ├── TempHistoryTable.jsx      # Telemetry history log
│   │   │   ├── ThresholdSettings.jsx     # Live threshold settings panel
│   │   │   ├── AlertsList.jsx            # System warning/critical alert history
│   │   │   └── TestSimulatorCard.jsx     # In-dashboard telemetry test runner
│   │   ├── services/
│   │   │   ├── api.js                    # Fetch HTTP client for REST endpoints
│   │   │   └── socket.js                 # Socket.IO client setup
│   │   ├── App.jsx                       # Main application state & WebSocket listeners
│   │   ├── main.jsx                      # React entrypoint
│   │   └── index.css                     # Tailwind CSS imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env                              # Frontend configuration file
│   └── package.json
│
├── esp32/
│   └── temperature_sensor.ino          # ESP32 C++ Arduino Firmware code
│
├── simulator.js                         # Node.js command-line ESP32 simulator
├── package.json                         # Root monorepo workspace scripts
└── README.md                            # Comprehensive Documentation
```

---

## ⚠️ USER CONFIGURATION REQUIRED

Before flashing your physical ESP32 device, you must configure your local Wi-Fi network credentials and backend server IP address in `esp32/temperature_sensor.ino`:

1. Open `esp32/temperature_sensor.ino` in **Arduino IDE**.
2. Update the following lines under `USER CONFIGURATION REQUIRED`:

```cpp
// ⚠️ EDIT THESE VARIABLES FOR YOUR NETWORK
const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // Your Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Your Wi-Fi Password
const char* SERVER_URL    = "http://192.168.1.100:5000/api/sensor/data"; // Your computer's local IP address
```

> **Note**: To find your computer's local IP address on Windows, run `ipconfig` in CMD or PowerShell and look for `IPv4 Address` (e.g. `192.168.1.x`).

---

## 🛠️ Required Software

- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher
- **Arduino IDE**: (Only needed if flashing physical ESP32) with ESP32 board support installed.

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🏁 Running the Application

### Option A: Run Backend and Frontend in separate terminals

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
```
*Backend will start on `http://localhost:5000`*

**Terminal 2 (Frontend Dashboard):**
```bash
cd frontend
npm run dev
```
*Frontend dashboard will open at `http://localhost:5173`*

---

## 🧪 How to Test Data WITHOUT Physical ESP32 Hardware

You can test the live updating dashboard in two convenient ways:

### Method 1: Using the CLI Simulator Script
Run the automated ESP32 simulator script in a new terminal:
```bash
node simulator.js
```
This script will post a new temperature reading every 3 seconds, simulating normal temperature fluctuations with periodic warning/critical spikes. Watch the frontend dashboard update instantly!

### Method 2: Using the In-Dashboard Quick-Test Panel
Open the dashboard at `http://localhost:5173`. Scroll to the **Interactive ESP32 Test Simulator** card and click:
- **Send Normal (28.5 °C)**
- **Send Warning (37.0 °C)**
- **Send Critical (43.5 °C)**
- Or input a custom temperature value and click **Send Custom POST**.

### Method 3: Using cURL or Postman
Send a POST request manually:
```bash
curl -X POST http://localhost:5000/api/sensor/data ^
  -H "Content-Type: application/json" ^
  -d "{\"deviceId\":\"ESP32-01\", \"temperature\":29.4}"
```

---

## 🔌 Connecting Physical ESP32 Hardware

### 1. Circuit Wiring Diagram

| Sensor Pin | ESP32 Board Connection |
| :--- | :--- |
| **VCC** | 3.3V (or 5V for module boards) |
| **GND** | GND |
| **DATA** | GPIO 4 (Digital Pin 4) |

*(Add a 10kΩ pull-up resistor between VCC and DATA pin if using a bare 3-pin DHT sensor)*

### 2. Arduino IDE Setup
1. Install **ESP32 Board Support** in Arduino IDE (`Tools` -> `Board` -> `Boards Manager` -> search `esp32`).
2. Install required libraries via `Sketch` -> `Include Library` -> `Manage Libraries`:
   - `ArduinoJson` (by Benoit Blanchon)
   - `DHT sensor library` (by Adafruit)
   - `Adafruit Unified Sensor` (by Adafruit)
3. Select your ESP32 board (`Tools` -> `Board` -> `ESP32 Dev Module`) and COM Port.
4. Upload `esp32/temperature_sensor.ino`.
5. Open Serial Monitor at **115200 baud**.

---

## 📡 API Endpoints Reference

### 1. Ingest Sensor Data
- **POST** `/api/sensor/data`
- **Body**:
  ```json
  {
    "deviceId": "ESP32-01",
    "temperature": 28.6
  }
  ```

### 2. Get Latest Reading
- **GET** `/api/sensor/latest`

### 3. Get Historical Data
- **GET** `/api/sensor/history?limit=50`

### 4. Get Sensor Statistics
- **GET** `/api/sensor/stats`

### 5. Get Device Online Status
- **GET** `/api/sensor/status`

### 6. Get Threshold Settings
- **GET** `/api/settings`

### 7. Update Threshold Settings
- **POST** `/api/settings`
- **Body**:
  ```json
  {
    "minTemp": 20.0,
    "maxTemp": 35.0,
    "criticalTemp": 40.0
  }
  ```

---

## 🔧 Troubleshooting

- **Frontend shows "Cannot connect to Backend Server"**:
  - Ensure the Node.js backend is running on port 5000 (`cd backend && npm run dev`).
  - Verify `.env` in `frontend` specifies `VITE_API_URL=http://localhost:5000`.

- **ESP32 HTTP POST fails with code -1 or connection refused**:
  - Ensure ESP32 and backend computer are connected to the **same Wi-Fi network**.
  - Replace `localhost` in ESP32 `SERVER_URL` with your computer's local Wi-Fi IP address (e.g. `192.168.1.50`).
  - Check Windows Firewall permissions for Node.js on port 5000.

- **SQLite Database location**:
  - The SQLite database is automatically generated at `backend/database/temperature.db`.
