const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test API Server',
    endpoints: ['/health', '/api/v1/']
  });
});

const server = app.listen(3000, '0.0.0.0', () => {
  console.log('Test server listening on port 3000');
  console.log('URL: http://localhost:3000');
  console.log('Health: http://localhost:3000/health');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Keep alive
setTimeout(() => {
  console.log('Server still running...');
}, 5000);