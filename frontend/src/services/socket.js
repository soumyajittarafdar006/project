import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (onConnectStatusChange) => {
  if (socket) return socket;

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected to backend');
    if (onConnectStatusChange) onConnectStatusChange(true);
  });

  socket.on('disconnect', () => {
    console.warn('❌ WebSocket disconnected');
    if (onConnectStatusChange) onConnectStatusChange(false);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
    if (onConnectStatusChange) onConnectStatusChange(false);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
