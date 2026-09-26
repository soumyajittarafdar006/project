/*
 * ============================================================================
 * ESP32 Temperature Monitoring System - Arduino Firmware
 * ============================================================================
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - DHT11 or DHT22 Temperature & Humidity Sensor (or DS18B20)
 * - 10k Ohm pull-up resistor (if sensor module doesn't include one)
 * 
 * Wiring:
 * - DHT VCC -> ESP32 3.3V (or 5V depending on module)
 * - DHT GND -> ESP32 GND
 * - DHT DATA -> ESP32 GPIO 4 (Configurable via DHTPIN)
 * 
 * Required Libraries (Install via Arduino Library Manager):
 * - WiFi (Built-in for ESP32)
 * - HTTPClient (Built-in for ESP32)
 * - ArduinoJson (by Benoit Blanchon, v6.x or v7.x)
 * - DHT sensor library (by Adafruit)
 * - Adafruit Unified Sensor (by Adafruit)
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================================================
// ⚠️ USER CONFIGURATION REQUIRED - EDIT THESE VARIABLES FOR YOUR NETWORK ⚠️
// ============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // Replace with your Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Replace with your Wi-Fi Password
const char* SERVER_URL    = "http://192.168.1.100:5000/api/sensor/data"; // Replace 192.168.1.100 with your computer's local IP

const char* DEVICE_ID     = "ESP32-01";            // Unique Device Identifier
const int READ_INTERVAL_MS = 3000;                  // Sending interval: 3 seconds (2-5 sec recommended)
// ============================================================================

// Sensor Configuration
#define DHTPIN 4         // Digital pin connected to the DHT sensor (GPIO4)
#define DHTTYPE DHT22    // Change to DHT11 if using a DHT11 sensor

DHT dht(DHTPIN, DHTTYPE);

// Globals
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("=========================================");
  Serial.println("🔥 ESP32 Temperature Monitor Starting...");
  Serial.println("=========================================");

  // Initialize DHT Sensor
  dht.begin();
  Serial.println("✅ DHT Sensor Initialized on GPIO " + String(DHTPIN));

  // Connect to Wi-Fi
  connectWiFi();
}

void loop() {
  // Check Wi-Fi connection and reconnect if lost
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Wi-Fi connection lost! Reconnecting...");
    connectWiFi();
  }

  // Send reading periodically
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= READ_INTERVAL_MS) {
    lastSendTime = currentMillis;
    readAndSendTemperature();
  }
}

// Function to handle Wi-Fi Connection & Auto-reconnect
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("📡 Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ Wi-Fi Connected Successfully!");
    Serial.print("📍 ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("❌ Wi-Fi Connection Failed! Will retry in next loop cycle.");
  }
}

// Function to read sensor data and post to backend
void readAndSendTemperature() {
  // Read temperature as Celsius
  float temp = dht.readTemperature();

  // If sensor read failed (e.g. wire disconnected during testing), fallback or alert
  if (isnan(temp)) {
    Serial.println("⚠️ Warning: Failed to read from DHT sensor! (Check wiring/pin)");
    return;
  }

  Serial.print("🌡️ Read Temperature: ");
  Serial.print(temp, 1);
  Serial.println(" °C");

  // Send HTTP POST to Backend API
  sendPostRequest(temp);
}

// HTTP POST Request Sender
void sendPostRequest(float temperature) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Cannot send HTTP POST: Wi-Fi disconnected");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON Payload using ArduinoJson
  StaticJsonDocument<128> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["temperature"] = serialized(String(temperature, 1)); // Single decimal place

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.print("📤 Sending POST to ");
  Serial.print(SERVER_URL);
  Serial.print(" Payload: ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Server Response (HTTP ");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
  } else {
    Serial.print("❌ HTTP POST Failed! Error Code: ");
    Serial.print(httpResponseCode);
    Serial.print(" (");
    Serial.print(http.errorToString(httpResponseCode));
    Serial.println(")");
  }

  http.end();
}
