const express = require('express');

const app = express();

// Add basic body parsing
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  console.log('Health check accessed');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Debug server is working'
  });
});

// API route
app.get('/api/v1/', (req, res) => {
  console.log('API root accessed');
  res.json({ 
    success: true,
    message: 'Debug API working',
    timestamp: new Date().toISOString()
  });
});

// Catch all
app.use('*', (req, res) => {
  console.log(`Catch-all route hit: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl
  });
});

const server = app.listen(3002, '0.0.0.0', () => {
  console.log('=== Debug server started ===');
  console.log('Port: 3002');
  console.log('Host: 0.0.0.0');
  console.log('URL: http://localhost:3002');
  console.log('Health: http://localhost:3002/health');
  console.log('==========================');
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
  console.error('Full error:', error);
});

server.on('connection', (socket) => {
  console.log('New connection established');
});

server.on('request', (req) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
});

console.log('Server setup complete, waiting for connections...');