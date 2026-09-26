const { Server } = require('socket.io');

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow connections from frontend dashboard
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

const broadcastTemperatureUpdate = (data) => {
  if (io) {
    io.emit('temperatureUpdate', data);
  }
};

const broadcastAlert = (alert) => {
  if (io) {
    io.emit('newAlert', alert);
  }
};

const broadcastSettingsUpdate = (settings) => {
  if (io) {
    io.emit('settingsUpdate', settings);
  }
};

module.exports = {
  init,
  getIo,
  broadcastTemperatureUpdate,
  broadcastAlert,
  broadcastSettingsUpdate
};
